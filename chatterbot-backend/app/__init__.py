"""Chatterbot Flask application factory."""
import logging
from datetime import timedelta
import click
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy import text
from config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri=settings.redis_url if settings.redis_url else None
)


def create_app(config_override=None):
    """Create and configure Flask application.
    
    Args:
        config_override: Optional dictionary to override config settings
    
    Returns:
        Flask application instance
    """
    from app.services.security_service import (
        apply_security_headers,
        assign_request_id,
        install_log_redaction,
    )

    app = Flask(__name__)
    install_log_redaction()

    # Config
    app.config["SECRET_KEY"] = settings.secret_key
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = settings.jwt_secret_key
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        seconds=settings.jwt_access_token_expires
    )
    app.config["DEBUG"] = settings.flask_debug
    app.config["JSON_SORT_KEYS"] = False
    app.config["SESSION_COOKIE_SECURE"] = settings.flask_env == "production"
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    
    # Set CORS based on environment
    if settings.flask_env == "development":
        cors_origins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:5000"]
    else:
        cors_origins = [settings.frontend_url]
    
    app.config["CORS_ORIGINS"] = cors_origins

    if config_override:
        app.config.update(config_override)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
    )

    @jwt.token_in_blocklist_loader
    def token_is_invalid(_header, payload):
        from app.models.user import User

        identity = str(payload.get("sub", ""))
        if not identity.isdigit():
            return True
        user = db.session.get(User, int(identity))
        return (
            user is None
            or not user.is_active
            or payload.get("sv") != (user.session_version or 0)
        )

    app.before_request(assign_request_id)
    app.after_request(
        lambda response: apply_security_headers(
            response, production=settings.flask_env == "production"
        )
    )
    
    # Only init limiter if redis is available
    if settings.redis_url:
        limiter.init_app(app)
    else:
        logger.warning("Redis not configured. Rate limiting disabled.")

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.sms import sms_bp
    from app.routes.dashboard_chat import dashboard_chat_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.webhook import webhook_bp
    from app.routes.admin import admin_bp
    from app.routes.support import support_bp
    from app.routes.mood import mood_bp
    from app.routes.digest import digest_bp
    from app.routes.checkin import checkin_bp
    from app.routes.counselor import counselor_bp
    from app.routes.referral import referral_bp
    from app.routes.gamification import gam_bp
    from app.routes.care_circle import care_circle_bp
    from app.routes.safety_plan import safety_plan_bp
    from app.routes.privacy import privacy_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(sms_bp, url_prefix="/api/sms")
    app.register_blueprint(dashboard_chat_bp, url_prefix="/api/dashboard-chat")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(webhook_bp, url_prefix="/api/webhooks")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(support_bp, url_prefix="/api/support")
    app.register_blueprint(mood_bp)
    app.register_blueprint(digest_bp)
    app.register_blueprint(checkin_bp)
    app.register_blueprint(counselor_bp)
    app.register_blueprint(referral_bp)
    app.register_blueprint(gam_bp, url_prefix="/api/gamification")
    app.register_blueprint(care_circle_bp, url_prefix="/api/care-circle")
    app.register_blueprint(safety_plan_bp, url_prefix="/api/safety-plans")
    app.register_blueprint(privacy_bp, url_prefix="/api/privacy")

    @app.cli.command("run-privacy-jobs")
    def run_privacy_jobs_command():
        """Apply configured retention and due deletion jobs."""
        from app.services.privacy_service import run_privacy_jobs

        result = run_privacy_jobs()
        print(
            f"Messages redacted: {result['messages_redacted']}; "
            f"deletions completed: {result['deletions_completed']}"
        )

    @app.cli.command("create-staff")
    @click.option("--name", prompt=True)
    @click.option("--email", prompt=True)
    @click.option(
        "--role",
        type=click.Choice(["viewer", "operator", "safety_lead", "admin"]),
        prompt=True,
    )
    @click.password_option(confirmation_prompt=True)
    def create_staff_command(name, email, role, password):
        """Create the first named staff account from a trusted environment."""
        from app.models.staff import StaffUser

        normalized_email = email.strip().lower()
        if len(password) < 12:
            raise click.ClickException("Staff passwords require at least 12 characters")
        if StaffUser.query.filter_by(email=normalized_email).first():
            raise click.ClickException("A staff account already uses this email")
        staff_user = StaffUser(
            name=name.strip(), email=normalized_email, role=role
        )
        staff_user.set_password(password)
        db.session.add(staff_user)
        db.session.commit()
        click.echo(f"Created {role} staff account for {normalized_email}")

    # Error handlers
    @app.errorhandler(400)
    def bad_request(e):
        logger.warning(f"Bad request: {e}")
        return {"error": "Bad request", "message": "Invalid request parameters"}, 400

    @app.errorhandler(404)
    def not_found(e):
        logger.warning(f"Not found: {e}")
        return {"error": "Not found", "message": "Resource not found"}, 404

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        logger.warning(f"Rate limit exceeded: {e}")
        return {"error": "Rate limit exceeded", "message": "Too many requests. Please try again later."}, 429

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        logger.error(f"Internal server error: {e}", exc_info=True)
        
        # In production, don't expose error details
        if settings.flask_env == "production":
            message = "An internal server error occurred. Please try again later."
        else:
            message = str(e)
        
        return {
            "error": "Internal server error",
            "message": message
        }, 500

    @app.route("/health/live")
    def liveness():
        """Confirm that the API process can serve requests."""
        return {"status": "alive", "service": "chatterbot-api"}, 200

    @app.route("/health/ready")
    def readiness():
        """Confirm production dependencies, schema, and privacy jobs are ready."""
        from app.services.readiness_service import readiness_report

        production = settings.flask_env == "production"
        report = readiness_report(
            check_migration=production,
            check_redis=production,
        )
        return report, 200 if report["ready"] else 503

    @app.route("/health")
    def health():
        """Backward compatible deployment readiness endpoint."""
        return readiness()

    # Developer/test databases remain convenient to bootstrap. Production
    # schema changes must run through the reviewed Alembic migration chain.
    if settings.flask_env != "production":
        with app.app_context():
            try:
                db.create_all()
                logger.info("Database tables initialized")
            except Exception as e:
                logger.error(f"Failed to initialize database: {e}")
                raise

    return app
