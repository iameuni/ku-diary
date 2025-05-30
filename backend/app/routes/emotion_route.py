from flask import Blueprint, request, jsonify
from app.services.emotion_service import predict_emotion

emotion_bp = Blueprint("emotion", __name__)

@emotion_bp.route("/emotion", methods=["POST"])
def analyze_emotion():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "텍스트가 비어 있음"}), 400

    label, confidence = predict_emotion(text)
    return jsonify({"emotion": label, "confidence": confidence})
