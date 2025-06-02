import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from app.services.unified_gpt_service import UnifiedGPTService

# 환경변수 로드
load_dotenv()

# OpenAI 클라이언트 초기화
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    print("⚠️ 경고: OPENAI_API_KEY가 설정되지 않았습니다!")
else:
    print(f"✅ API Key 로드됨: sk-...{api_key[-4:]}")

client = OpenAI(api_key=api_key)

# 통합 서비스 인스턴스
unified_service = UnifiedGPTService()

def generate_4cuts(text, emotion):
    """기존 4컷 웹툰 생성 함수 - 통합 서비스 사용"""
    
    # API 키 확인
    if not api_key:
        return {
            "error": "OpenAI API 키가 설정되지 않았습니다. 환경변수를 확인하세요."
        }
    
    try:
        # 통합 서비스로 분석 및 스토리 생성
        analysis = {
            'emotion': emotion,
            'summary': text,
            'emotion_intensity': 5,
            'keywords': []
        }
        
        story_result = unified_service.create_webtoon_story(analysis, "캐릭터")
        
        # 기존 형식으로 변환
        result = {}
        for i, panel in enumerate(story_result.get('panels', [])[:4], 1):
            result[f'cut{i}'] = panel.get('scene', f'{i}번째 장면')
            result[f'bubble{i}'] = panel.get('dialogue', '...')
        
        # 누락된 컷 채우기
        for i in range(1, 5):
            if f'cut{i}' not in result:
                result[f'cut{i}'] = f"{i}번째 장면"
                result[f'bubble{i}'] = "..."
        
        print("✅ 웹툰 생성 완료!")
        return result
        
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

# 기존 call_gpt_api와의 호환성을 위한 별칭
call_gpt_api = generate_4cuts

# 추가 기능들
def generate_story_from_diary(diary_text):
    """일기에서 바로 스토리 생성 (새 기능)"""
    # 먼저 분석
    analysis = unified_service.analyze_diary(diary_text)
    
    # 스토리 생성
    story = unified_service.create_webtoon_story(analysis, "나나")
    
    return {
        'analysis': analysis,
        'story': story,
        'success': True
    }

# 테스트 함수
if __name__ == "__main__":
    # 직접 실행 시 테스트
    test_result = call_gpt_api(
        "오늘 친구와 싸웠지만 나중에 사과해서 기분이 나아졌다.", 
        "중립"
    )
    print(json.dumps(test_result, ensure_ascii=False, indent=2))