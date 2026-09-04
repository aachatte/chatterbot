"""Add global enable_gamification setting."""
from pydantic import ConfigDict, ValidationError, field_validator, model_validator
from pydantic_settings import BaseSettings

from datetime import datetime

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    app_name: str = "Chatterbot"
    app_url: str = "http://localhost:5000"
    flask_env: str = "development"
    flask_debug: bool = False
    secret_key: str = "dev-secret-key-change-in-production"

    # Database
    database_url: str = "sqlite:///chatterbot.db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = "jwt-dev-secret"
    jwt_access_token_expires: int = 3600  # 1 hour

    # Administration
    admin_api_key: str = ""

    # Twilio
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id: str = ""

    # Crisis
    crisis_escalation_email: str = ""
    crisis_escalation_phone: str = ""

    # Rate Limiting
    rate_limit_enabled: bool = True
    auth_rate_limit: str = "5/minute"
    api_rate_limit: str = "100/minute"

    # Gamification feature flag
    enable_gamification: bool = True

    # Product defaults that must be confirmed during privacy counsel review.
    privacy_policy_version: str = "privacy-2026-09-05-draft"
    message_retention_days: int = 90
    deletion_grace_days: int = 7
    pilot_mode: bool = True
    pilot_family_capacity: int = 50

    @field_validator('message_retention_days', 'deletion_grace_days', 'pilot_family_capacity')
    @classmethod
    def validate_positive_operating_limits(cls, v):
        if v <= 0:
            raise ValueError('Privacy and pilot operating limits must be greater than zero')
        return v

    @field_validator('jwt_access_token_expires')
    @classmethod
    def validate_jwt_expiry(cls, v):
        """Require a positive access-token lifetime."""
        if v <= 0:
            raise ValueError('JWT_ACCESS_TOKEN_EXPIRES must be greater than zero')
        return v

    @field_validator('openai_api_key')
    @classmethod
    def validate_openai_key(cls, v):
        """Validate OpenAI API key if provided."""
        if v and not v.startswith('sk-'):
            raise ValueError('Invalid OpenAI API key format')
        return v

    @field_validator('stripe_secret_key')
    @classmethod
    def validate_stripe_key(cls, v):
        """Validate Stripe API key if provided."""
        if v and not v.startswith('sk_'):
            raise ValueError('Invalid Stripe API key format')
        return v

    @model_validator(mode='after')
    def validate_production_settings(self):
        """Reject insecure credentials and debug mode in production."""
        if self.flask_env != 'production':
            return self
        for field_name in ('secret_key', 'jwt_secret_key'):
            value = getattr(self, field_name)
            if not value or value.startswith('dev-') or len(value) < 32:
                raise ValueError(
                    'Production requires secure secrets '
                    '(minimum 32 characters, no "dev-" prefix)'
                )
        if self.flask_debug:
            raise ValueError('FLASK_DEBUG must be disabled in production')
        if len(self.admin_api_key) < 32:
            raise ValueError('Production requires an ADMIN_API_KEY of at least 32 characters')
        return self


try:
    settings = Settings()
except ValidationError as e:
    print(f"Configuration Error: {e}")
    raise
