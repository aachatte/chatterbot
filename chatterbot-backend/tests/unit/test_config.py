"""Unit tests for configuration."""
import pytest
from config import Settings
from pydantic import ValidationError


class TestSettings:
    """Test configuration settings validation."""

    def test_default_settings(self):
        """Test default settings are valid."""
        settings = Settings()
        assert settings.app_name == "Chatterbot"
        assert settings.flask_env == "development"
        assert settings.flask_debug is False

    def test_production_secret_validation(self):
        """Test that production environment requires secure secrets."""
        with pytest.raises(ValidationError):
            Settings(
                flask_env="production",
                secret_key="dev-secret-key",
            )

    def test_production_secure_secret(self):
        """Test that secure secrets pass validation in production."""
        settings = Settings(
            flask_env="production",
            secret_key="a" * 32,
            jwt_secret_key="b" * 32,
            admin_api_key="c" * 32,
        )
        assert settings.flask_env == "production"
        assert len(settings.secret_key) == 32

    def test_production_debug_is_rejected(self):
        """Test that production cannot enable Flask's interactive debugger."""
        with pytest.raises(ValidationError):
            Settings(
                flask_env="production",
                flask_debug=True,
                secret_key="a" * 32,
                jwt_secret_key="b" * 32,
                admin_api_key="c" * 32,
            )

    def test_jwt_expiry_must_be_positive(self):
        """Test that access tokens require a positive expiration."""
        with pytest.raises(ValidationError):
            Settings(jwt_access_token_expires=0)

    def test_production_admin_key_must_be_secure(self):
        """Test that production requires a dedicated administrative credential."""
        with pytest.raises(ValidationError):
            Settings(
                flask_env="production",
                secret_key="a" * 32,
                jwt_secret_key="b" * 32,
            )

    def test_openai_key_validation(self):
        """Test OpenAI API key format validation."""
        with pytest.raises(ValidationError):
            Settings(openai_api_key="invalid-key")

    def test_stripe_key_validation(self):
        """Test Stripe API key format validation."""
        with pytest.raises(ValidationError):
            Settings(stripe_secret_key="invalid-key")

    def test_valid_openai_key(self):
        """Test valid OpenAI key passes validation."""
        settings = Settings(openai_api_key="sk-test123")
        assert settings.openai_api_key == "sk-test123"

    def test_valid_stripe_key(self):
        """Test valid Stripe key passes validation."""
        settings = Settings(stripe_secret_key="sk_test123")
        assert settings.stripe_secret_key == "sk_test123"
