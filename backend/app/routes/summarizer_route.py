from flask import Blueprint, request, jsonify
from app.services.summarizer_service import (
    summarize_text_service, 
    summarize_diary_for_webtoon, 
    generate_scene_description
)

summarizer_bp = Blueprint("summarizer", __name__)

@summarizer_bp.route("/summarize", methods=["POST"])
def summarize():
    """기본 텍스트 요약 API"""
    try:
        data = request.get_json()
        input_text = data.get("text", "")
        
        if not input_text:
            return jsonify({"error": "텍스트가 비어 있습니다."}), 400
        
        print(f"텍스트 요약 요청: {input_text[:50]}...")
        
        summary = summarize_text_service(input_text)
        
        return jsonify({
            "summary": summary,
            "original_length": len(input_text),
            "summary_length": len(summary),
            "compression_ratio": round(len(summary) / len(input_text) * 100, 1)
        })
        
    except Exception as e:
        print(f"텍스트 요약 오류: {e}")
        return jsonify({"error": str(e)}), 500

@summarizer_bp.route("/summarize_for_webtoon", methods=["POST"])
def summarize_for_webtoon():
    """웹툰 제작용 일기 요약 API"""
    try:
        data = request.get_json()
        diary_text = data.get("text", "")
        emotion = data.get("emotion", "")
        
        if not diary_text:
            return jsonify({"error": "일기 내용이 비어 있습니다."}), 400
        
        print(f"웹툰용 일기 요약 요청: {diary_text[:50]}...")
        
        # 웹툰용 요약
        webtoon_summary = summarize_diary_for_webtoon(diary_text)
        
        # 장면 설명 생성 (감정이 있는 경우)
        scene_description = None
        if emotion:
            scene_description = generate_scene_description(diary_text, emotion)
        
        return jsonify({
            "webtoon_summary": webtoon_summary,
            "scene_description": scene_description,
            "emotion": emotion,
            "original_text": diary_text[:100] + "..." if len(diary_text) > 100 else diary_text
        })
        
    except Exception as e:
        print(f"웹툰용 요약 오류: {e}")
        return jsonify({"error": str(e)}), 500

@summarizer_bp.route("/generate_scene", methods=["POST"])
def generate_scene():
    """웹툰 장면 설명 생성 API"""
    try:
        data = request.get_json()
        diary_text = data.get("text", "")
        emotion = data.get("emotion", "평온")
        character_name = data.get("character_name", "캐릭터")
        
        if not diary_text:
            return jsonify({"error": "일기 내용이 비어 있습니다."}), 400
        
        print(f"웹툰 장면 생성 요청: {emotion} 감정, {character_name}")
        
        scene_description = generate_scene_description(diary_text, emotion)
        
        return jsonify({
            "scene_description": scene_description,
            "emotion": emotion,
            "character_name": character_name,
            "suitable_for_illustration": True
        })
        
    except Exception as e:
        print(f"장면 생성 오류: {e}")
        return jsonify({"error": str(e)}), 500

@summarizer_bp.route("/batch_summarize", methods=["POST"])
def batch_summarize():
    """여러 텍스트 일괄 요약 API (주간 웹툰용)"""
    try:
        data = request.get_json()
        texts = data.get("texts", [])
        summary_type = data.get("type", "basic")  # basic, webtoon
        
        if not texts or not isinstance(texts, list):
            return jsonify({"error": "텍스트 배열이 필요합니다."}), 400
        
        print(f"일괄 요약 요청: {len(texts)}개 텍스트, 타입: {summary_type}")
        
        summaries = []
        
        for i, text in enumerate(texts):
            try:
                if summary_type == "webtoon":
                    summary = summarize_diary_for_webtoon(text)
                else:
                    summary = summarize_text_service(text)
                
                summaries.append({
                    "index": i,
                    "original": text[:50] + "..." if len(text) > 50 else text,
                    "summary": summary,
                    "success": True
                })
                
            except Exception as text_error:
                print(f"텍스트 {i} 요약 실패: {text_error}")
                summaries.append({
                    "index": i,
                    "original": text[:50] + "..." if len(text) > 50 else text,
                    "summary": "요약 실패",
                    "success": False,
                    "error": str(text_error)
                })
        
        successful_count = sum(1 for s in summaries if s["success"])
        
        return jsonify({
            "summaries": summaries,
            "total_count": len(texts),
            "successful_count": successful_count,
            "success_rate": round(successful_count / len(texts) * 100, 1)
        })
        
    except Exception as e:
        print(f"일괄 요약 오류: {e}")
        return jsonify({"error": str(e)}), 500

@summarizer_bp.route("/summarize/test", methods=["GET"])
def test_summarizer():
    """요약 API 테스트용"""
    return jsonify({
        "message": "요약 API가 정상 작동 중입니다.",
        "available_endpoints": [
            "POST /summarize - 기본 텍스트 요약",
            "POST /summarize_for_webtoon - 웹툰용 일기 요약",
            "POST /generate_scene - 웹툰 장면 설명 생성",
            "POST /batch_summarize - 일괄 요약"
        ]
    })