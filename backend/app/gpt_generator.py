import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# 환경변수 로드
load_dotenv()

# OpenAI 클라이언트 초기화
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    print("⚠️ 경고: OPENAI_API_KEY가 설정되지 않았습니다!")
else:
    print(f"✅ API Key 로드됨: sk-...{api_key[-4:]}")

client = OpenAI(api_key=api_key)

def call_gpt_api(text, emotion):
    """4컷 웹툰 생성 - 실제 GPT API 호출"""
    
    # API 키 확인
    if not api_key:
        return {
            "error": "OpenAI API 키가 설정되지 않았습니다. 환경변수를 확인하세요."
        }
    
    prompt = f"""
    사용자의 일기를 4컷 웹툰으로 만들어주세요.
    
    일기 내용: "{text}"
    오늘의 감정: {emotion}
    
    각 컷은 하나의 장면과 짧은 대사로 구성됩니다.
    시간 순서대로 이야기가 전개되도록 만들어주세요.
    
    다음 JSON 형식으로만 응답해주세요:
    {{
        "cut1": "첫 번째 장면 설명",
        "bubble1": "첫 번째 대사",
        "cut2": "두 번째 장면 설명",
        "bubble2": "두 번째 대사",
        "cut3": "세 번째 장면 설명",
        "bubble3": "세 번째 대사",
        "cut4": "네 번째 장면 설명",
        "bubble4": "네 번째 대사"
    }}
    """
    
    try:
        print(f"🤖 GPT API 호출 중... (모델: gpt-3.5-turbo)")
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "당신은 감정 일기를 4컷 웹툰으로 변환하는 전문가입니다. 감정을 잘 표현하고 이야기의 흐름이 자연스럽게 만들어주세요."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=400,
            response_format={"type": "json_object"}  # JSON 응답 강제
        )
        
        content = response.choices[0].message.content
        print(f"✅ GPT 응답 받음: {len(content)} 글자")
        
        # JSON 파싱
        result = json.loads(content)
        
        # 필수 키 확인
        required_keys = ["cut1", "bubble1", "cut2", "bubble2", "cut3", "bubble3", "cut4", "bubble4"]
        missing_keys = [key for key in required_keys if key not in result]
        
        if missing_keys:
            print(f"⚠️ 누락된 키: {missing_keys}")
            # 누락된 키에 기본값 추가
            for key in missing_keys:
                if "cut" in key:
                    result[key] = "장면 설명이 없습니다"
                else:
                    result[key] = "..."
        
        print("✅ 웹툰 생성 완료!")
        return result
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON 파싱 오류: {e}")
        return {
            "error": "GPT 응답을 파싱할 수 없습니다",
            "raw_response": content if 'content' in locals() else None
        }
    
    except Exception as e:
        print(f"❌ GPT API 오류: {type(e).__name__}: {str(e)}")
        
        # 자세한 오류 메시지
        if "insufficient_quota" in str(e):
            return {
                "error": "OpenAI API 크레딧이 부족합니다. 결제를 확인하세요."
            }
        elif "invalid_api_key" in str(e):
            return {
                "error": "유효하지 않은 API 키입니다. 키를 다시 확인하세요."
            }
        else:
            return {
                "error": f"GPT API 호출 중 오류 발생: {str(e)}"
            }

# 테스트 함수
if __name__ == "__main__":
    # 직접 실행 시 테스트
    test_result = call_gpt_api(
        "오늘 친구와 싸웠지만 나중에 사과해서 기분이 나아졌다.", 
        "중립"
    )
    print(json.dumps(test_result, ensure_ascii=False, indent=2))