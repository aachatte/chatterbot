"""Chatterbot Flask application factory."""
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
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
    app = Flask(__name__)

    # Config
    app.config["SECRET_KEY"] = settings.secret_key
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = settings.jwt_secret_key
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = settings.jwt_access_token_expires
    app.config["JSON_SORT_KEYS"] = False
    
    # Set CORS based on environment
    if settings.flask_env == "development":
        cors_origins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:5000"]
    else:
        cors_origins = [settings.app_url, "https://chatterbot-topaz.vercel.app"]
    
    app.config["CORS_ORIGINS"] = cors_origins

    if config_override:
        app.config.update(config_override)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": cors_origins}})
    
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

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(sms_bp, url_prefix="/api/sms")
    app.register_blueprint(dashboard_chat_bp, url_prefix="/api/dashboard-chat")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(webhook_bp, url_prefix="/api/webhooks")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

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

    # Health check endpoint
    @app.route("/health")
    def health():
        """Health check endpoint for load balancers and monitoring."""
        try:
            # Test database connection
            db.session.execute("SELECT 1")
            db.session.close()
            return {
                "status": "healthy",
                "service": "chatterbot-api",
                "environment": settings.flask_env
            }, 200
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "service": "chatterbot-api",
                "error": "Database connection failed"
            }, 503

    # Create tables
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise

    return app
