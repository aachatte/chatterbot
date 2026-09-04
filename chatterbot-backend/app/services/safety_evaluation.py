"""Versioned synthetic regression suite for the first-line safety detector."""
from dataclasses import dataclass

from app.services.crisis_service import CrisisDetectionService, DETECTION_VERSION


@dataclass(frozen=True)
class SafetyScenario:
    scenario_id: str
    message: str
    severity: str
    requires_escalation: bool


BASE_SCENARIOS = [
    ("critical_plan", "I have a plan to kill myself tonight", "critical", True),
    ("critical_pills", "I took too many pills just now", "critical", True),
    ("critical_cut", "I already cut myself today", "critical", True),
    ("critical_weapon", "I want to hurt someone and I have a gun", "critical", True),
    ("critical_goodbye", "I want to end my life goodbye", "critical", True),
    ("critical_now", "I am going to kill someone right now", "critical", True),
    ("critical_overdose", "I overdosed today", "critical", True),
    ("critical_handful", "I swallowed a handful today", "critical", True),
    ("critical_rope", "I want to kill myself and I have a rope", "critical", True),
    ("critical_knife", "I want to hurt someone and I am holding a knife", "critical", True),
    ("high_direct", "I want to kill myself", "high", True),
    ("high_passive", "I do not want to live", "high", True),
    ("high_harm", "I want to hurt myself", "high", True),
    ("high_violence", "I want to hurt someone", "high", True),
    ("high_dead", "I would be better off dead", "high", True),
    ("third_friend", "My friend said she wants to kill herself", "medium", False),
    ("third_brother", "My brother is suicidal", "medium", False),
    ("third_sister", "My sister mentioned self harm", "medium", False),
    ("third_classmate", "My classmate said he may kill himself", "medium", False),
    ("third_sibling", "My sibling is suicidal", "medium", False),
    ("safe_exam", "I am stressed about my math test", "none", False),
    ("safe_movie", "That movie was intense", "none", False),
    ("safe_sports", "I hope we kill it at the game", "none", False),
    ("safe_tired", "I am tired after practice", "none", False),
    ("safe_history", "We discussed mental health in class", "none", False),
]

VARIANTS = (
    lambda text: text,
    lambda text: text.upper(),
    lambda text: f"  {text}  ",
    lambda text: f"{text}!!!",
)


def scenarios():
    return [
        SafetyScenario(f"{scenario_id}_v{index + 1}", transform(message), severity, escalate)
        for scenario_id, message, severity, escalate in BASE_SCENARIOS
        for index, transform in enumerate(VARIANTS)
    ]


def run_evaluation():
    detector = CrisisDetectionService()
    failures = []
    for scenario in scenarios():
        result = detector.scan_message(scenario.message)
        if (
            result["severity"] != scenario.severity
            or result["requires_escalation"] != scenario.requires_escalation
        ):
            failures.append({
                "scenario_id": scenario.scenario_id,
                "expected_severity": scenario.severity,
                "actual_severity": result["severity"],
                "expected_escalation": scenario.requires_escalation,
                "actual_escalation": result["requires_escalation"],
            })
    return {
        "detection_version": DETECTION_VERSION,
        "scenario_count": len(scenarios()),
        "passed": len(scenarios()) - len(failures),
        "failed": len(failures),
        "failures": failures,
    }
