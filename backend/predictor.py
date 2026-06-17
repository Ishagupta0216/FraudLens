import os
import pickle

from utils import (
    analyze_patterns,
    build_explanation,
    get_risk_level,
    preprocess_text,
)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "model", "vectorizer.pkl")


class FraudPredictor:
    def __init__(self):
        self.model = None
        self.vectorizer = None

    def load_model(self):
        if self.model is not None and self.vectorizer is not None:
            return

        missing_files = [
            path for path in (MODEL_PATH, VECTORIZER_PATH) if not os.path.exists(path)
        ]
        if missing_files:
            missing_names = ", ".join(os.path.basename(path) for path in missing_files)
            raise FileNotFoundError(f"Missing model artifact(s): {missing_names}")

        with open(MODEL_PATH, "rb") as model_file:
            self.model = pickle.load(model_file)

        with open(VECTORIZER_PATH, "rb") as vectorizer_file:
            self.vectorizer = pickle.load(vectorizer_file)

    def predict(self, text):
        self.load_model()

        cleaned_text = preprocess_text(text)
        if not cleaned_text:
            raise ValueError("Text does not contain enough usable content for prediction.")

        features = self.vectorizer.transform([cleaned_text])
        fraud_probability = float(self.model.predict_proba(features)[0][1])
        ml_score = int(round(fraud_probability * 100))

        pattern_analysis = analyze_patterns(cleaned_text)
        category = pattern_analysis["category"]
        keywords = pattern_analysis["keywords"]
        matched_patterns = pattern_analysis["matched_patterns"]
        rule_score = pattern_analysis["rule_score"]

        if pattern_analysis["legitimate_only"]:
            ml_score = min(ml_score, 35)

        risk_score = int(round((0.65 * ml_score) + (0.35 * rule_score)))
        risk_level = get_risk_level(risk_score)
        explanation = build_explanation(
            category,
            keywords,
            risk_level,
            pattern_analysis["explanation"],
        )
        confidence = round(risk_score / 100, 2)

        return {
            "risk_score": risk_score,
            "ml_score": ml_score,
            "rule_score": rule_score,
            "confidence": confidence,
            "risk_level": risk_level,
            "category": category,
            "category_confidence": pattern_analysis["category_confidence"],
            "matched_patterns": matched_patterns,
            "keywords": keywords,
            "legitimate_indicators": pattern_analysis["legitimate_indicators"],
            "explanation": explanation,
        }
