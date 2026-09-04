"""Safety rule, response, and guardian privacy tests."""
from app.models.crisis_alert import CrisisAlert
from app.models.teen import Teen
from app.services.crisis_service import CrisisDetectionService, DETECTION_VERSION


def test_explicit_self_harm_is_high_and_escalated():
    result = CrisisDetectionService().scan_message("I want to kill myself")
    assert result["is_crisis"] is True
    assert result["requires_escalation"] is True
    assert result["severity"] == "high"
    assert result["categories"] == ["self_harm"]
    assert result["detection_version"] == DETECTION_VERSION


def test_imminent_self_harm_is_critical():
    result = CrisisDetectionService().scan_message(
        "I have a plan to kill myself tonight and I have the pills"
    )
    assert result["severity"] == "critical"
    assert result["imminent"] is True
    assert result["requires_escalation"] is True


def test_third_party_risk_routes_support_without_alerting_on_the_teen():
    result = CrisisDetectionService().scan_message(
        "My friend said she wants to kill herself"
    )
    assert result["is_crisis"] is True
    assert result["third_party"] is True
    assert result["severity"] == "medium"
    assert result["requires_escalation"] is False


def test_ordinary_distress_does_not_create_a_crisis_decision():
    result = CrisisDetectionService().scan_message(
        "I am stressed about tomorrow's math test"
    )
    assert result["is_crisis"] is False
    assert result["severity"] == "none"


def test_crisis_response_contains_real_world_help():
    service = CrisisDetectionService()
    result = service.scan_message("I took too many pills just now")
    response = service.safe_response("Maya", result)
    assert "988" in response
    assert "911" in response
    assert "trusted adult" in response
    assert "AI" in response


def test_guardian_serialization_hides_internal_matching_rules():
    alert = CrisisAlert(
        teen_id=1,
        severity="critical",
        categories=["self_harm"],
        keywords_matched=[r"\bkill\s+myself\b"],
        confidence=0.84,
        detection_version=DETECTION_VERSION,
    )
    alert.teen = Teen(parent_id=1, first_name="Maya", phone="+15555550111")
    payload = alert.to_dict()
    assert "keywords_matched" not in payload
    assert payload["categories"] == ["self_harm"]
    assert payload["recommended_actions"]
