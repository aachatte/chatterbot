from app.services.safety_evaluation import run_evaluation, scenarios


def test_versioned_safety_benchmark_has_at_least_100_scenarios():
    assert len(scenarios()) >= 100


def test_versioned_safety_benchmark_has_no_regressions():
    report = run_evaluation()
    assert report["failed"] == 0, report["failures"]
    assert report["passed"] == report["scenario_count"]
