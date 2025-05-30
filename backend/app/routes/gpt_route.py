from flask import Blueprint, request, jsonify
from app.services.gpt_service import generate_4cuts

gpt_bp = Blueprint("gpt", __name__)

@gpt_bp.route("/generate_4cuts", methods=["POST"])
def generate_cuts():
    """4컷 웹툰 생성 API"""
    data = request.get_json()
    text = data.get("text", "")
    emotion = data.get("emotion", "")
    
    if not text:
        return jsonify({"error": "일기 텍스트가 비어 있습니다."}), 400
    
    result = generate_4cuts(text, emotion)
    return jsonify(result)

# 새로운 라우트 추가
@gpt_bp.route("/generate_daily_cut", methods=["POST"])
def generate_daily():
    """하루 1컷 생성 API"""
    data = request.get_json()
    text = data.get("text", "")
    emotion = data.get("emotion", "")
    previous_cuts = data.get("previous_cuts", [])
    
    if not text:
        return jsonify({"error": "일기 텍스트가 비어 있습니다."}), 400
    
    # 임시로 4컷 생성 함수 사용 (나중에 수정)
    result = generate_4cuts(text, emotion)
    
    # 첫 번째 컷만 반환하도록 변환
    if "error" not in result:
        daily_result = {
            "scene": result.get("cut1", ""),
            "dialogue": result.get("bubble1", ""),
            "mood": emotion
        }
        return jsonify(daily_result)
    