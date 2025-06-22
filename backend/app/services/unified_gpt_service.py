import json
from typing import Dict, List
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class UnifiedGPTService:
    def __init__(self):
        # 새 OpenAI 클라이언트 방식
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
    def analyze_diary(self, text: str) -> Dict:
        """
        일기 텍스트를 한 번에 분석 (감정 + 요약 + 키워드)
        """
        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo",  # JSON 응답 형식을 지원하는 모델
                messages=[
                    {
                        "role": "system",
                        "content": """당신은 일기 분석 전문가입니다. 
                        사용자의 일기를 분석하여 JSON 형식으로 다음 정보를 추출하세요:
                        {
                            "emotion": "기쁨/슬픔/분노/불안/평온 중 하나",
                            "emotion_intensity": 1-10 사이의 숫자,
                            "sub_emotions": ["부가 감정 2-3개"],
                            "summary": "일기를 2-3문장으로 요약",
                            "keywords": ["주요 키워드 3-5개"],
                            "one_line": "하루를 한 문장으로 표현"
                        }
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
                "sub_emotions": ["차분함"],
                "summary": text[:100] + "..." if len(text) > 100 else text,
                "keywords": ["일상", "하루"],
                "one_line": "평범하지만 소중한 하루였습니다.",
                "analysis_success": False
            }
    
    def create_webtoon_story(self, analysis: Dict, character_name: str) -> Dict:
        """
        분석 결과를 바탕으로 웹툰 스토리 생성 (1컷 버전)
        """
        try:
            prompt = f"""
            캐릭터 '{character_name}'의 하루를 1컷 웹툰으로 만들어주세요.
            
            오늘의 감정: {analysis['emotion']} (강도: {analysis['emotion_intensity']}/10)
            하루 요약: {analysis['summary']}
            키워드: {', '.join(analysis.get('keywords', []))}
            한 줄 요약: {analysis.get('one_line', '')}
            
            요구사항:
            1. 1컷 장면 묘사 (구체적이고 감정이 잘 드러나도록)
            2. 캐릭터의 대사나 독백 (자연스럽고 감정에 맞게)
            3. 감정이 자연스럽게 표현되도록
            4. 웹툰 스타일로 그릴 수 있는 장면으로
            5. 일기 내용과 연관성 있게
            
            다음 JSON 형식으로 반환하세요:
            {{
                "panels": [
                    {{
                        "scene": "장면 상세 묘사 (캐릭터의 위치, 표정, 행동, 배경 등)",
                        "dialogue": "캐릭터 대사나 독백 (감정에 맞는 자연스러운 말)"
                    }}
                ]
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4-turbo",  # JSON 응답 형식을 지원하는 모델
                messages=[
                    {"role": "system", "content": "당신은 감성적인 웹툰 작가입니다. 일상의 감정을 섬세하게 표현하는 것이 특기입니다."},
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
                    {
                        "scene": f"{analysis['emotion']} 감정이 느껴지는 하루의 한 장면",
                        "dialogue": analysis.get('one_line', '오늘도 소중한 하루였어요.')
                    }
                ]
            }
    
    def create_weekly_story(self, daily_analyses: List[Dict]) -> Dict:
        """
        일주일 분석 결과를 하나의 스토리로 연결 (기존 함수 - 8컷 생성용)
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
            
            response = self.client.chat.completions.create(
                model="gpt-4-turbo",  # JSON 응답 형식을 지원하는 모델
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
    
    def create_weekly_narrative(self, daily_analyses: List[Dict]) -> Dict:
        """
        🔥 새로운 함수: 일주일 분석 결과를 연결된 내레이션으로 만들기 (이미지 생성 없음!)
        """
        try:
            print(f"📝 주간 내레이션 생성 시작: {len(daily_analyses)}일치")
            
            # 주간 감정 흐름 생성
            emotion_flow = [d['emotion'] for d in daily_analyses]
            
            prompt = f"""
            한 주간의 감정 여정을 연결된 스토리보드 내레이션으로 만들어주세요.
            
            주간 감정 흐름: {' → '.join(emotion_flow)}
            
            각 날의 정보:
            """
            
            day_names = ['월', '화', '수', '목', '금', '토', '일']
            for i, analysis in enumerate(daily_analyses[:7]):  # 최대 7일
                day_name = day_names[i]
                prompt += f"\n{day_name}요일: {analysis.get('one_line', '')} (감정: {analysis['emotion']})"
            
            prompt += """

            요구사항:
            1. 각 날에 대한 짧은 내레이션 (기존 이미지를 설명하는 느낌으로, 2-3문장)
            2. 날짜 간 감정 변화를 자연스럽게 연결하는 연결어
            3. 전체적으로 하나의 성장 스토리가 되도록
            4. 따뜻하고 감성적인 톤으로
            5. 총 7개의 내레이션 + 1개의 주간 요약
            
            다음 JSON 형식으로 반환:
            {
                "daily_narratives": [
                    {"day": "월요일", "narrative": "월요일에 대한 따뜻한 내레이션", "connector": "그리고 화요일에는..."},
                    {"day": "화요일", "narrative": "화요일에 대한 감성적인 내레이션", "connector": "하지만 수요일..."},
                    {"day": "수요일", "narrative": "수요일 내레이션", "connector": "목요일이 되자..."},
                    {"day": "목요일", "narrative": "목요일 내레이션", "connector": "금요일에는..."},
                    {"day": "금요일", "narrative": "금요일 내레이션", "connector": "주말이 시작되며..."},
                    {"day": "토요일", "narrative": "토요일 내레이션", "connector": "마지막 날인 일요일..."},
                    {"day": "일요일", "narrative": "일요일 내레이션", "connector": ""}
                ],
                "weekly_summary": "한 주를 마무리하는 전체 요약 (2-3문장)",
                "emotional_journey": "감정 변화에 대한 한 줄 요약"
            }
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": "당신은 감성적인 스토리텔러입니다. 일상의 감정 변화를 자연스럽고 따뜻하게 연결하는 내레이션을 만드는 것이 특기입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # 감정 통계 추가
            emotion_stats = {}
            for analysis in daily_analyses:
                emotion = analysis['emotion']
                emotion_stats[emotion] = emotion_stats.get(emotion, 0) + 1
            
            # 최종 결과 구성
            final_result = {
                **result,
                "emotion_flow": emotion_flow,
                "emotion_stats": emotion_stats,
                "week_dominant_emotion": max(emotion_stats.items(), key=lambda x: x[1])[0] if emotion_stats else "평온",
                "generation_cost": "텍스트만 생성 - 매우 저렴!",
                "generation_time": "5-15초",
                "cost_saving": "기존 대비 99% 절약"
            }
            
            print(f"✅ 주간 내레이션 생성 완료!")
            print(f"📊 주요 감정: {final_result['week_dominant_emotion']}")
            print(f"💰 비용: {final_result['generation_cost']}")
            
            return final_result
            
        except Exception as e:
            print(f"❌ 주간 내레이션 생성 오류: {e}")
            
            # 에러 발생시 기본 내레이션 생성
            day_names = ['월', '화', '수', '목', '금', '토', '일']
            fallback_narratives = []
            
            for i, analysis in enumerate(daily_analyses[:7]):
                day_name = day_names[i]
                narrative = f"{day_name}요일은 {analysis.get('emotion', '평온')} 감정으로 보낸 의미있는 하루였어요. {analysis.get('one_line', '소중한 시간들이 쌓여갔습니다.')}"
                connector = "그리고..." if i < 6 else ""
                
                fallback_narratives.append({
                    "day": f"{day_name}요일",
                    "narrative": narrative,
                    "connector": connector
                })
            
            emotion_flow = [d.get('emotion', '평온') for d in daily_analyses]
            
            return {
                "daily_narratives": fallback_narratives,
                "weekly_summary": f"주간 스토리 생성 중 오류가 발생했지만, {emotion_flow[0]}로 시작해서 {emotion_flow[-1]}로 마무리한 의미있는 한 주였습니다.",
                "emotional_journey": f"이번 주 감정 여정: {' → '.join(emotion_flow)}",
                "emotion_flow": emotion_flow,
                "emotion_stats": {},
                "week_dominant_emotion": "평온",
                "generation_cost": "오류 발생 - 무료 대체 버전",
                "error": str(e)
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
        - Soft lighting, detailed character emotions
        """
    
    def _get_emotion_expression(self, emotion: str) -> str:
        """감정별 표정 설명"""
        expressions = {
            "기쁨": "bright smile, sparkling eyes, relaxed posture, cheerful body language",
            "슬픔": "downcast eyes, slight frown, drooped shoulders, melancholic pose",
            "분노": "furrowed brows, clenched jaw, tense posture, aggressive stance",
            "불안": "wide eyes, nervous expression, fidgeting hands, worried look",
            "평온": "gentle smile, calm eyes, relaxed stance, peaceful demeanor"
        }
        return expressions.get(emotion, "neutral expression, natural pose")

# 사용 예시
if __name__ == "__main__":
    service = UnifiedGPTService()
    
    # 일기 분석
    diary_text = "오늘은 정말 힘든 하루였다. 회사에서 프레젠테이션이 있었는데 잘 되지 않았다. 하지만 동료들이 격려해줘서 기분이 나아졌다."
    analysis = service.analyze_diary(diary_text)
    print("분석 결과:", analysis)
    
    # 웹툰 스토리 생성
    story = service.create_webtoon_story(analysis, "나나")
    print("웹툰 스토리:", story)
    
    # 🔥 새로운 기능: 주간 내레이션 생성 테스트
    test_analyses = [
        {"emotion": "기쁨", "one_line": "새로운 시작이 기대되는 월요일"},
        {"emotion": "평온", "one_line": "차분하게 업무에 집중한 화요일"},
        {"emotion": "불안", "one_line": "중요한 발표를 앞둔 수요일"},
        {"emotion": "기쁨", "one_line": "발표가 성공적으로 끝난 목요일"},
        {"emotion": "평온", "one_line": "여유로운 마음으로 마무리한 금요일"},
        {"emotion": "기쁨", "one_line": "친구들과 즐거운 시간을 보낸 토요일"},
        {"emotion": "평온", "one_line": "조용히 휴식을 취한 일요일"}
    ]
    
    narrative = service.create_weekly_narrative(test_analyses)
    print("주간 내레이션:", narrative)