from flask import Blueprint, request, jsonify
from datetime import datetime
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Blueprint 생성
diary_bp = Blueprint('diary', __name__)

# OpenAI 클라이언트
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

@diary_bp.route('/api/diary/analyze', methods=['POST'])
def analyze_diary():
    """일기 분석 API"""
    try:
        data = request.json
        diary_text = data.get('text', '')
        
        if not diary_text:
            return jsonify({"error": "일기 내용이 없습니다."}), 400
        
        print(f"일기 분석 요청: {diary_text[:50]}...")
        
        # GPT를 사용한 실제 분석
        try:
            prompt = f"""
            다음 일기를 분석해주세요:
            "{diary_text}"
            
            다음 형식의 JSON으로 응답해주세요:
            {{
                "emotion": "기쁨/슬픔/분노/불안/평온 중 하나",
                "emotion_intensity": 1-10 사이의 숫자,
                "sub_emotions": ["부가 감정 2-3개"],
                "summary": "일기를 2-3문장으로 요약",
                "keywords": ["주요 키워드 3-5개"],
                "one_line": "하루를 한 문장으로 표현"
            }}
            """
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "당신은 감정 일기 분석 전문가입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            import json
            analysis = json.loads(response.choices[0].message.content)
            analysis["analysis_success"] = True
            
            print(f"분석 완료: {analysis['emotion']}")
            return jsonify(analysis)
            
        except Exception as gpt_error:
            print(f"GPT 분석 실패: {gpt_error}")
            # GPT 실패 시 기본 분석 제공
            analysis = {
                "emotion": "평온",
                "emotion_intensity": 5,
                "sub_emotions": ["차분함", "안정감"],
                "summary": diary_text[:100] + "..." if len(diary_text) > 100 else diary_text,
                "keywords": ["일상", "하루", "일기"],
                "one_line": "평범하지만 소중한 하루였습니다.",
                "analysis_success": False
            }
            return jsonify(analysis)
            
    except Exception as e:
        print(f"분석 오류: {e}")
        return jsonify({"error": str(e)}), 500

@diary_bp.route('/api/diary/save', methods=['POST'])
def save_diary():
    """일기 저장"""
    try:
        data = request.json
        # 임시 응답
        return jsonify({
            "status": "success",
            "message": "일기가 저장되었습니다.",
            "diary_id": "temp_" + datetime.now().strftime("%Y%m%d%H%M%S")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@diary_bp.route('/api/diary/list', methods=['GET'])
def get_diary_list():
    """일기 목록 조회"""
    try:
        # 임시 응답
        return jsonify({
            "status": "success",
            "diaries": []
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500