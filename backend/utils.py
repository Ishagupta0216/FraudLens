import re


LEGITIMATE_INDICATORS = [
    "payment successful",
    "credited",
    "salary credited",
    "recharge successful",
    "bill payment",
    "payment received",
    "merchant payment",
    "swiggy",
    "zomato",
    "amazon",
    "flipkart",
    "uber",
    "ola",
]

FRAUD_SIGNATURES = {
    "KYC Scam": {
        "threshold": 80,
        "high": ["kyc", "verify account", "update kyc", "re kyc", "kyc expires", "kyc expire"],
        "medium": ["verify", "verification", "account verification", "expire", "expires"],
        "low": ["today", "immediately", "urgent", "complete"],
        "explanation": "Message classified as KYC Scam because it contains KYC-related verification language and urgency indicators.",
    },
    "Reward Scam": {
        "threshold": 60,
        "high": ["claim reward", "claim your reward", "lottery", "prize"],
        "medium": ["reward", "gift", "bonus", "cashback"],
        "low": ["claim", "now", "verify"],
        "explanation": "Message classified as Reward Scam because it offers a reward, prize, or gift and asks the user to claim it.",
    },
    "Account Blocking Scam": {
        "threshold": 60,
        "high": [
            "deactivate account",
            "account blocked",
            "account suspended",
            "account will be blocked",
        ],
        "medium": ["blocked", "suspended", "restricted", "deactivate"],
        "low": ["account", "today", "immediately", "urgent"],
        "explanation": "Message classified as Account Blocking Scam because it threatens account blocking or restriction to force action.",
    },
    "UPI Collect Request Scam": {
        "threshold": 30,
        "high": ["collect request", "approve request", "pending approval", "receive money after approval"],
        "medium": ["request money", "receive money", "approval", "approve"],
        "low": ["upi", "collect", "pending", "refund", "payment"],
        "explanation": "Message classified as UPI Collect Request Scam because it asks the user to approve a collect request or approval flow to receive money.",
    },
    "Phishing": {
        "threshold": 60,
        "high": ["download apk", "install app", "click link"],
        "medium": ["verify now", "urgent action", "login", "password", "otp"],
        "low": ["link", "click", "download", "install", "urgent"],
        "explanation": "Message classified as Phishing because it uses link, app installation, credential, or urgent-action language.",
    },
}

WEIGHTS = {
    "high": 25,
    "medium": 15,
    "low": 5,
    "legitimate": -15,
}

MAX_CATEGORY_SCORE = 60


def preprocess_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " link ", text)
    text = text.replace("re-kyc", "re kyc")
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def contains_phrase(cleaned_text, phrase):
    pattern = r"\b" + re.escape(phrase) + r"\b"
    return re.search(pattern, cleaned_text) is not None


def find_matches(cleaned_text, phrases):
    return [phrase for phrase in phrases if contains_phrase(cleaned_text, phrase)]


def calculate_category_score(cleaned_text, signature):
    matched_patterns = []
    keywords = []
    score = 0

    for level in ("high", "medium", "low"):
        matches = find_matches(cleaned_text, signature[level])
        if matches:
            score += len(matches) * WEIGHTS[level]
            matched_patterns.extend(
                f"{level.title()} confidence indicator: {match}" for match in matches
            )
            keywords.extend(matches)

    confidence = min(int(round((score / MAX_CATEGORY_SCORE) * 100)), 100)

    return {
        "score": score,
        "confidence": confidence,
        "matched_patterns": matched_patterns,
        "keywords": keywords,
    }


def analyze_patterns(cleaned_text):
    legitimate_matches = find_matches(cleaned_text, LEGITIMATE_INDICATORS)
    category_results = {}

    for category, signature in FRAUD_SIGNATURES.items():
        category_results[category] = calculate_category_score(cleaned_text, signature)

    best_category = max(category_results, key=lambda item: category_results[item]["confidence"])
    best_result = category_results[best_category]
    fraud_score = sum(result["score"] for result in category_results.values())
    legitimate_score = len(legitimate_matches) * abs(WEIGHTS["legitimate"])
    rule_score = max(0, min(100, fraud_score - legitimate_score))
    has_fraud_evidence = fraud_score > 0
    has_strong_legitimate_evidence = len(legitimate_matches) > 0 and not has_fraud_evidence

    if best_result["confidence"] < FRAUD_SIGNATURES[best_category]["threshold"]:
        category = "Legitimate Transaction"
        matched_patterns = [
            f"Legitimate indicator: {match}" for match in legitimate_matches
        ]
        keywords = legitimate_matches
        explanation = build_legitimate_explanation(legitimate_matches)
        category_confidence = 100 if has_strong_legitimate_evidence else 0
    else:
        category = best_category
        matched_patterns = best_result["matched_patterns"]
        keywords = sorted(set(best_result["keywords"]))
        explanation = FRAUD_SIGNATURES[best_category]["explanation"]
        category_confidence = best_result["confidence"]

    return {
        "category": category,
        "category_confidence": category_confidence,
        "matched_patterns": matched_patterns,
        "keywords": keywords,
        "legitimate_indicators": legitimate_matches,
        "rule_score": rule_score,
        "legitimate_only": has_strong_legitimate_evidence,
        "explanation": explanation,
    }


def get_risk_level(risk_score):
    if risk_score >= 70:
        return "High"
    if risk_score >= 40:
        return "Medium"
    return "Low"


def build_legitimate_explanation(legitimate_matches):
    if legitimate_matches:
        evidence = ", ".join(legitimate_matches[:3])
        return (
            "Message classified as Legitimate Transaction because it contains common "
            f"transaction-completion indicators: {evidence}."
        )

    return (
        "Message classified as Legitimate Transaction because no fraud pattern reached "
        "the confidence threshold."
    )


def build_explanation(category, keywords, risk_level, base_explanation=None):
    if category == "Legitimate Transaction":
        return base_explanation or build_legitimate_explanation(keywords)

    keyword_text = ", ".join(keywords[:4]) if keywords else "no strong fraud indicators"
    base = base_explanation or "Message matched a fraud pattern with sufficient confidence."

    return f"{base} Evidence: {keyword_text}. Risk level is {risk_level}."
