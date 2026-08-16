"""Chatterbot Flask application factory."""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import settings

# Extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
limiter = Limiter(key_func=get_remote_address)


def create_app(config_override=None):
    app = Flask(__name__)

    # Config
    app.config["SECRET_KEY"] = settings.secret_key
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = settings.jwt_secret_key
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = settings.jwt_access_token_expires
    app.config["CORS_ORIGINS"] = ["*"] if settings.flask_env == "development" else [settings.app_url]

    if config_override:
        app.config.update(config_override)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)
    limiter.init_app(app)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.sms import sms_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.webhook import webhook_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(sms_bp, url_prefix="/api/sms")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(webhook_bp, url_prefix="/api/webhooks")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Not found", "message": str(e)}, 404

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return {"error": "Internal server error", "message": str(e)}, 500

    # Health check
    @app.route("/health")
    def health():
        return {"status": "ok", "service": "chatterbot-api"}

    # Create tables
    with app.app_context():
        db.create_all()

    return app
