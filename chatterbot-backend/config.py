"""Chatterbot application configuration."""
import os
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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
