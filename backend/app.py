import json
import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from predictor import FraudPredictor


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
METRICS_PATH = os.path.join(BASE_DIR, "model", "metrics.json")

app = Flask(__name__)
CORS(app)

predictor = FraudPredictor()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})


@app.route("/metrics", methods=["GET"])
def metrics():
    try:
        with open(METRICS_PATH, "r", encoding="utf-8") as metrics_file:
            saved_metrics = json.load(metrics_file)
        return jsonify(saved_metrics), 200
    except FileNotFoundError:
        return (
            jsonify(
                {
                    "error": "Metrics file is missing. Run 'python train.py' inside the backend folder first."
                }
            ),
            500,
        )


@app.route("/predict", methods=["POST"])
def predict():
    try:
        payload = request.get_json(silent=True)

        if not payload:
            return jsonify({"error": "Request body must be valid JSON."}), 400

        text = payload.get("text")
        if not isinstance(text, str) or not text.strip():
            return jsonify({"error": "Field 'text' is required and must be a non-empty string."}), 400

        result = predictor.predict(text)
        return jsonify(result), 200

    except FileNotFoundError as exc:
        return (
            jsonify(
                {
                    "error": "Model files are missing. Run 'python train.py' inside the backend folder first.",
                    "details": str(exc),
                }
            ),
            500,
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": "Prediction failed.", "details": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
