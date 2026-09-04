"""HTTP security and privacy safe logging helpers."""
import logging
import re
import uuid

from flask import g, request

REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9._:]{8,64}$")
PHONE_PATTERN = re.compile(r"(?<!\d)(?:\+?1[ .-]?)?(?:\(?\d{3}\)?[ .-]?)\d{3}[ .-]?\d{4}(?!\d)")
SECRET_PATTERN = re.compile(r"\b(?:sk|whsec|eyJ)[A-Za-z0-9._-]{12,}\b")


class SensitiveDataFilter(logging.Filter):
    """Redact common contact and credential shapes before log emission."""

    def filter(self, record):
        rendered = record.getMessage()
        rendered = PHONE_PATTERN.sub("[redacted-phone]", rendered)
        rendered = SECRET_PATTERN.sub("[redacted-secret]", rendered)
        record.msg = rendered
        record.args = ()
        return True


def install_log_redaction():
    root = logging.getLogger()
    for handler in root.handlers:
        if not any(isinstance(item, SensitiveDataFilter) for item in handler.filters):
            handler.addFilter(SensitiveDataFilter())


def assign_request_id():
    supplied = request.headers.get("X-Request-ID", "")
    g.request_id = supplied if REQUEST_ID_PATTERN.fullmatch(supplied) else uuid.uuid4().hex


def apply_security_headers(response, production=False):
    response.headers["X-Request-ID"] = g.get("request_id", uuid.uuid4().hex)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    response.headers["Cache-Control"] = "no-store"
    if production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    logging.getLogger("app.requests").info(
        "request complete method=%s path=%s status=%s request_id=%s",
        request.method,
        request.path,
        response.status_code,
        g.get("request_id"),
    )
    return response
