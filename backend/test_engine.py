from predictor import FraudPredictor
from utils import analyze_patterns, get_risk_level, preprocess_text


TEST_CASES = [
    {
        "text": "UPI payment to Swiggy successful",
        "expected": "Legitimate Transaction",
        "expected_risk": "Low",
    },
    {
        "text": "Salary credited to account",
        "expected": "Legitimate Transaction",
        "expected_risk": "Low",
    },
    {
        "text": "Electricity bill payment successful",
        "expected": "Legitimate Transaction",
        "expected_risk": "Low",
    },
    {
        "text": "Payment received from Rahul",
        "expected": "Legitimate Transaction",
        "expected_risk": "Low",
    },
    {
        "text": "Your KYC will expire today. Verify immediately.",
        "expected": "KYC Scam",
        "expected_risk": "Medium",
    },
    {
        "text": "Claim your reward now.",
        "expected": "Reward Scam",
        "expected_risk": "Medium",
    },
    {
        "text": "Your account will be blocked.",
        "expected": "Account Blocking Scam",
        "expected_risk": "Medium",
    },
    {
        "text": "Approve collect request to receive money.",
        "expected": "UPI Collect Request Scam",
        "expected_risk": "Medium",
    },
]


def is_expected_risk(actual, expected):
    if expected == "Medium":
        return actual in {"Medium", "High"}
    return actual == expected


def run_tests():
    predictor = build_test_predictor()
    rows = []

    for case in TEST_CASES:
        result = predictor.predict(case["text"])
        passed = (
            result["category"] == case["expected"]
            and is_expected_risk(result["risk_level"], case["expected_risk"])
        )
        rows.append(
            {
                "text": case["text"],
                "predicted_category": result["category"],
                "risk_score": result["risk_score"],
                "risk_level": result["risk_level"],
                "expected": case["expected"],
                "pass_fail": "PASS" if passed else "FAIL",
            }
        )

    print("\nFraudLens Detection Engine Test Results")
    print("-" * 120)
    print(
        f"{'Input':45} | {'Predicted Category':25} | {'Risk':10} | "
        f"{'Expected Result':25} | {'Pass/Fail'}"
    )
    print("-" * 120)

    for row in rows:
        print(
            f"{row['text'][:45]:45} | "
            f"{row['predicted_category'][:25]:25} | "
            f"{row['risk_score']:3} {row['risk_level'][:6]:6} | "
            f"{row['expected'][:25]:25} | "
            f"{row['pass_fail']}"
        )

    passed_count = sum(1 for row in rows if row["pass_fail"] == "PASS")
    print("-" * 120)
    print(f"Passed {passed_count}/{len(rows)} tests")


def build_test_predictor():
    try:
        predictor = FraudPredictor()
        predictor.load_model()
        return predictor
    except (FileNotFoundError, ModuleNotFoundError) as exc:
        print(f"ML model unavailable for test run: {exc}")
        print("Running rule-engine fallback tests.\n")
        return RuleOnlyPredictor()


class RuleOnlyPredictor:
    def predict(self, text):
        analysis = analyze_patterns(preprocess_text(text))
        risk_score = analysis["rule_score"]

        return {
            "category": analysis["category"],
            "risk_score": risk_score,
            "risk_level": get_risk_level(risk_score),
        }


if __name__ == "__main__":
    run_tests()
