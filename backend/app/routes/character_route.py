from flask import Blueprint, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

character_bp = Blueprint("character", __name__)

@character_bp.route("/api/generate_character", methods=["POST"])
def generate_character():
    """사용자 맞춤형 캐릭터 생성"""
    
    try:
        data = request.get_json()
        
        # 디버깅을 위한 로그
        print(f"받은 데이터: {data}")
        
        prompt = data.get("prompt", "")
        emotion = data.get("emotion", "중립")
        character_description = data.get("character_description", "")
        
        if not prompt:
            return jsonify({"error": "프롬프트가 없습니다."}), 400
        
        # 일관성을 위한 추가 지시사항
        enhanced_prompt = f"""
        {prompt}
        
        중요 지시사항:
        - 정확히 같은 캐릭터를 그려주세요
        - 캐릭터는 정면을 향하고 전신이 보이도록
        - 배경은 순수한 흰색
        - 선명하고 깔끔한 라인
        - 웹툰/만화 스타일 유지
        - 그림자나 복잡한 효과 최소화
        """
        
        print(f"DALL-E 프롬프트: {enhanced_prompt[:100]}...")
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        image_url = response.data[0].url
        
        print(f"생성된 이미지 URL: {image_url[:50]}...")
        
        return jsonify({
            "url": image_url,
            "emotion": emotion,
            "character_description": character_description
        })
        
    except Exception as e:
        print(f"에러 발생: {type(e).__name__}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@character_bp.route("/api/generate_character", methods=["GET"])
def test_generate_character():
    """GET 요청 테스트용"""
    return jsonify({"message": "캐릭터 생성 API가 작동 중입니다. POST 요청을 사용하세요."})