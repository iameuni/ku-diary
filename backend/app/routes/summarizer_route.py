from flask import Blueprint, request, jsonify
from app.services.summarizer_service import summarize_text_service

summarizer_bp = Blueprint("summarizer", __name__)

@summarizer_bp.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    input_text = data.get("text", "")
    if not input_text:
        return jsonify({"error": "텍스트가 비어 있습니다."}), 400

    summary = summarize_text_service(input_text)
    return jsonify({"summary": summary})