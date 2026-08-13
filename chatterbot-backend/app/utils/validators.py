"""Input validation utilities."""
import re
import phonenumbers


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_phone(phone: str, region="US") -> tuple:
    """Validate and format phone number."""
    try:
        parsed = phonenumbers.parse(phone, region)
        if phonenumbers.is_valid_number(parsed):
            return True, phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        return False, None
    except phonenumbers.NumberParseException:
        return False, None


def validate_password(password: str) -> tuple:
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number"
    return True, ""


def sanitize_sms_input(text: str, max_length: int = 1600) -> str:
    """Sanitize inbound SMS text."""
    if not text:
        return ""
    # Remove control characters except newlines
    text = "".join(c for c in text if c == "\n" or (ord(c) >= 32 and ord(c) <= 126) or ord(c) > 127)
    return text[:max_length].strip()
