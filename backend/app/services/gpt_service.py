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
    """기존 4컷 웹툰 생성 함수 - 통합 서비스 사용 (GPT-4 업데이트)"""
        
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
            'keywords': [],
            'one_line': text[:50] + "..." if len(text) > 50 else text
        }
                
        # 4컷 웹툰 스토리 생성 (GPT-4 사용)
        try:
            prompt = f"""
            다음 일기를 바탕으로 4컷 웹툰 스토리를 만들어주세요.
            
            일기 내용: {text}
            주요 감정: {emotion}
            
            요구사항:
            1. 4컷으로 구성 (시작 → 전개 → 절정 → 마무리)
            2. 각 컷마다 장면 묘사와 대사 제공
            3. 감정 변화가 자연스럽게 흐르도록
            4. 웹툰 스타일로 그릴 수 있는 장면
            
            다음 JSON 형식으로 응답하세요:
            {{
                "panels": [
                    {{"scene": "1컷 장면 묘사", "dialogue": "1컷 대사"}},
                    {{"scene": "2컷 장면 묘사", "dialogue": "2컷 대사"}},
                    {{"scene": "3컷 장면 묘사", "dialogue": "3컷 대사"}},
                    {{"scene": "4컷 장면 묘사", "dialogue": "4컷 대사"}}
                ]
            }}
            """
            
            response = client.chat.completions.create(
                model="gpt-4",  # GPT-4 사용
                messages=[
                    {"role": "system", "content": "당신은 일상을 웹툰으로 만드는 전문가입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                response_format={"type": "json_object"}
            )
            
            story_result = json.loads(response.choices[0].message.content)
            
        except Exception as gpt_error:
            print(f"GPT-4 스토리 생성 실패, 통합 서비스 사용: {gpt_error}")
            story_result = unified_service.create_webtoon_story(analysis, "캐릭터")
                
        # 기존 형식으로 변환 (호환성 유지)
        result = {}
        panels = story_result.get('panels', [])
        
        for i in range(4):
            if i < len(panels):
                result[f'cut{i+1}'] = panels[i].get('scene', f'{i+1}번째 장면')
                result[f'bubble{i+1}'] = panels[i].get('dialogue', '...')
            else:
                result[f'cut{i+1}'] = f"{i+1}번째 장면"
                result[f'bubble{i+1}'] = "..."
                
        print("✅ 4컷 웹툰 생성 완료!")
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
    """일기에서 바로 스토리 생성 (새 기능) - GPT-4 사용"""
    try:
        # 먼저 분석
        analysis = unified_service.analyze_diary(diary_text)
            
        # 스토리 생성
        story = unified_service.create_webtoon_story(analysis, "나나")
            
        return {
            'analysis': analysis,
            'story': story,
            'success': True
        }
    except Exception as e:
        print(f"스토리 생성 오류: {e}")
        return {
            'analysis': None,
            'story': None,
            'success': False,
            'error': str(e)
        }

def generate_daily_webtoon(diary_text, emotion):
    """일일 웹툰 1컷 생성 (GPT-4 사용)"""
    try:
        analysis = {
            'emotion': emotion,
            'summary': diary_text,
            'emotion_intensity': 5,
            'keywords': [],
            'one_line': diary_text[:50] + "..." if len(diary_text) > 50 else diary_text
        }
        
        story = unified_service.create_webtoon_story(analysis, "나나")
        
        # 첫 번째 패널만 반환
        if story and 'panels' in story and len(story['panels']) > 0:
            panel = story['panels'][0]
            return {
                'scene': panel.get('scene', '오늘의 한 장면'),
                'dialogue': panel.get('dialogue', ''),
                'emotion': emotion,
                'success': True
            }
        else:
            return {
                'scene': f"{emotion} 감정이 느껴지는 하루",
                'dialogue': "오늘도 소중한 하루였어요.",
                'emotion': emotion,
                'success': False
            }
            
    except Exception as e:
        print(f"일일 웹툰 생성 오류: {e}")
        return {
            'scene': "오늘의 한 장면",
            'dialogue': "일기를 작성해주세요.",
            'emotion': emotion,
            'success': False,
            'error': str(e)
        }

# 테스트 함수
if __name__ == "__main__":
    # 직접 실행 시 테스트
    test_result = call_gpt_api(
        "오늘 친구와 싸웠지만 나중에 사과해서 기분이 나아졌다.", 
        "기쁨"
    )
    print(json.dumps(test_result, ensure_ascii=False, indent=2))