import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def summarize_text_service(text: str) -> str:
    """
    텍스트 요약 서비스
    """
    try:
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        prompt = f"""
        다음 텍스트를 간결하고 핵심적으로 요약해주세요:
        
        "{text}"
        
        요구사항:
        1. 핵심 내용만 포함
        2. 2-3문장으로 요약
        3. 중요한 감정이나 사건 포함
        4. 자연스러운 한국어로 작성
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 텍스트 요약 전문가입니다. 핵심 내용을 간결하게 요약하는 것이 특기입니다."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        summary = response.choices[0].message.content.strip()
        print(f"✅ 텍스트 요약 완료: {summary[:50]}...")
        
        return summary
        
    except Exception as e:
        print(f"❌ 텍스트 요약 실패: {e}")
        # 실패 시 기본 요약 제공
        return text[:100] + "..." if len(text) > 100 else text

def summarize_diary_for_webtoon(diary_text: str) -> str:
    """
    웹툰 생성을 위한 일기 요약 (더 감정 중심)
    """
    try:
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        prompt = f"""
        다음 일기를 웹툰 제작에 적합하도록 요약해주세요:
        
        "{diary_text}"
        
        요구사항:
        1. 주요 감정과 상황을 포함
        2. 시각적으로 표현 가능한 장면 중심
        3. 캐릭터의 행동과 반응 포함
        4. 웹툰 1컷으로 만들 수 있는 핵심 순간
        5. 1-2문장으로 간결하게
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 웹툰 스토리보드 작가입니다. 일기를 시각적 장면으로 변환하는 것이 특기입니다."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=150
        )
        
        summary = response.choices[0].message.content.strip()
        print(f"✅ 웹툰용 일기 요약 완료: {summary}")
        
        return summary
        
    except Exception as e:
        print(f"❌ 웹툰용 일기 요약 실패: {e}")
        return diary_text[:80] + "..." if len(diary_text) > 80 else diary_text

def generate_scene_description(diary_text: str, emotion: str) -> str:
    """
    일기와 감정을 바탕으로 웹툰 장면 설명 생성
    """
    try:
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        prompt = f"""
        일기 내용과 감정을 바탕으로 웹툰 장면을 상세히 묘사해주세요:
        
        일기: "{diary_text}"
        감정: {emotion}
        
        요구사항:
        1. 캐릭터의 위치, 표정, 자세 포함
        2. 배경과 분위기 묘사
        3. {emotion} 감정이 잘 드러나도록
        4. 실제 그림으로 그릴 수 있는 구체적 장면
        5. 한 문단으로 상세하게 작성
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 웹툰 장면 연출 전문가입니다. 감정과 상황을 시각적으로 표현하는 것이 특기입니다."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=250
        )
        
        description = response.choices[0].message.content.strip()
        print(f"✅ 장면 설명 생성 완료: {description[:50]}...")
        
        return description
        
    except Exception as e:
        print(f"❌ 장면 설명 생성 실패: {e}")
        return f"{emotion} 감정이 느껴지는 일상의 한 장면"