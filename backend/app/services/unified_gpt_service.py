import openai
import json
from typing import Dict, List, Tuple
import os
from dotenv import load_dotenv

load_dotenv()

class UnifiedGPTService:
    def __init__(self):
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
    def analyze_diary(self, text: str) -> Dict:
        """
        일기 텍스트를 한 번에 분석 (감정 + 요약 + 키워드)
        """
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """당신은 일기 분석 전문가입니다. 
                        사용자의 일기를 분석하여 JSON 형식으로 다음 정보를 추출하세요:
                        1. 주요 감정 (기쁨/슬픔/분노/불안/평온 중 하나)
                        2. 감정 강도 (1-10)
                        3. 부가 감정들
                        4. 핵심 요약 (2-3문장)
                        5. 주요 키워드 (3-5개)
                        6. 하루를 한 문장으로 표현
                        """
                    },
                    {
                        "role": "user",
                        "content": f"다음 일기를 분석해주세요:\n\n{text}"
                    }
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # 기본 구조 보장
            return {
                "emotion": result.get("emotion", "평온"),
                "emotion_intensity": result.get("emotion_intensity", 5),
                "sub_emotions": result.get("sub_emotions", []),
                "summary": result.get("summary", ""),
                "keywords": result.get("keywords", []),
                "one_line": result.get("one_line", ""),
                "analysis_success": True
            }
            
        except Exception as e:
            print(f"GPT 분석 오류: {e}")
            return {
                "emotion": "평온",
                "emotion_intensity": 5,
                "sub_emotions": [],
                "summary": text[:100] + "...",
                "keywords": [],
                "one_line": "분석 중 오류가 발생했습니다.",
                "analysis_success": False
            }
    
    def create_webtoon_story(self, analysis: Dict, character_name: str) -> Dict:
        """
        분석 결과를 바탕으로 웹툰 스토리 생성
        """
        try:
            prompt = f"""
            캐릭터 '{character_name}'의 하루를 4컷 웹툰으로 만들어주세요.
            
            오늘의 감정: {analysis['emotion']} (강도: {analysis['emotion_intensity']}/10)
            하루 요약: {analysis['summary']}
            키워드: {', '.join(analysis['keywords'])}
            
            요구사항:
            1. 4컷 각각의 장면 묘사
            2. 각 컷의 대사
            3. 감정이 자연스럽게 드러나도록
            4. 마지막 컷은 하루를 마무리하는 느낌으로
            
            JSON 형식으로 반환하세요.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "당신은 감성적인 웹툰 작가입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"스토리 생성 오류: {e}")
            return {
                "panels": [
                    {"scene": "오류 발생", "dialogue": "..."},
                ] * 4
            }
    
    def create_weekly_story(self, daily_analyses: List[Dict]) -> Dict:
        """
        일주일 분석 결과를 하나의 스토리로 연결
        """
        try:
            # 주간 감정 흐름 생성
            emotion_flow = [d['emotion'] for d in daily_analyses]
            
            prompt = f"""
            한 주간의 감정 여정을 하나의 연결된 이야기로 만들어주세요.
            
            주간 감정 흐름: {' → '.join(emotion_flow)}
            
            각 날의 하이라이트:
            """
            
            for i, analysis in enumerate(daily_analyses):
                prompt += f"\n{i+1}일차: {analysis['one_line']} (감정: {analysis['emotion']})"
            
            prompt += """
            
            요구사항:
            1. 전체가 하나의 성장 스토리가 되도록
            2. 각 날의 감정 변화가 자연스럽게 연결
            3. 8컷 웹툰으로 구성 (중요한 날은 2컷 사용 가능)
            4. 희망적인 메시지로 마무리
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "당신은 감동적인 스토리텔러입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )
            
            return {
                "weekly_story": response.choices[0].message.content,
                "emotion_journey": emotion_flow
            }
            
        except Exception as e:
            print(f"주간 스토리 생성 오류: {e}")
            return {
                "weekly_story": "주간 스토리 생성 중 오류가 발생했습니다.",
                "emotion_journey": []
            }
    
    def generate_webtoon_prompt(self, panel_info: Dict, character_description: str, emotion: str) -> str:
        """
        웹툰 이미지 생성을 위한 DALL-E 프롬프트 생성
        """
        return f"""
        Korean webtoon style illustration:
        - Character: {character_description} showing {emotion} emotion
        - Scene: {panel_info['scene']}
        - Expression: {self._get_emotion_expression(emotion)}
        - Include speech bubble with: "{panel_info['dialogue']}"
        - Clean line art, pastel colors, vertical panel format
        - Emphasize emotional expression and body language
        """
    
    def _get_emotion_expression(self, emotion: str) -> str:
        """감정별 표정 설명"""
        expressions = {
            "기쁨": "bright smile, sparkling eyes, relaxed posture",
            "슬픔": "downcast eyes, slight frown, drooped shoulders",
            "분노": "furrowed brows, clenched jaw, tense posture",
            "불안": "wide eyes, nervous expression, fidgeting hands",
            "평온": "gentle smile, calm eyes, relaxed stance"
        }
        return expressions.get(emotion, "neutral expression")

# 사용 예시
if __name__ == "__main__":
    service = UnifiedGPTService()
    
    # 일기 분석
    diary_text = "오늘은 정말 힘든 하루였다. 회사에서 프레젠테이션이 있었는데..."
    analysis = service.analyze_diary(diary_text)
    print("분석 결과:", analysis)
    
    # 웹툰 스토리 생성
    story = service.create_webtoon_story(analysis, "나나")
    print("웹툰 스토리:", story)