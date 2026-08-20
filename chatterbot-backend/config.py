"""Chatterbot application configuration."""
import os
from pydantic import validator, ValidationError
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "Chatterbot"
    app_url: str = "http://localhost:5000"
    flask_env: str = "development"
    flask_debug: bool = True
    secret_key: str = "dev-secret-key-change-in-production"

    # Database
    database_url: str = "sqlite:///chatterbot.db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = "jwt-dev-secret"
    jwt_access_token_expires: int = 3600  # 1 hour

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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    @validator('secret_key', 'jwt_secret_key')
    def validate_production_secrets(cls, v, values):
        """Enforce secure secrets in production environment."""
        flask_env = values.get('flask_env', 'development')
        if flask_env == 'production':
            if not v or v.startswith('dev-') or len(v) < 32:
                raise ValueError(
                    f'Production environment requires secure secrets '
                    f'(minimum 32 characters, no "dev-" prefix)'
                )
        return v

    @validator('openai_api_key')
    def validate_openai_key(cls, v, values):
        """Validate OpenAI API key if provided."""
        if v and not v.startswith('sk-'):
            raise ValueError('Invalid OpenAI API key format')
        return v

    @validator('stripe_secret_key')
    def validate_stripe_key(cls, v, values):
        """Validate Stripe API key if provided."""
        if v and not v.startswith('sk_'):
            raise ValueError('Invalid Stripe API key format')
        return v


try:
    settings = Settings()
except ValidationError as e:
    print(f"Configuration Error: {e}")
    raise
