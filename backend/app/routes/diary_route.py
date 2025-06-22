from flask import Blueprint, request, jsonify, send_from_directory
from datetime import datetime
import os
import json
import requests
import uuid
from openai import OpenAI
from dotenv import load_dotenv
from config.firebase_config import db  # Firebase 연동
from app.services.unified_gpt_service import UnifiedGPTService

load_dotenv()

# Blueprint 생성
diary_bp = Blueprint('diary', __name__)

# OpenAI 클라이언트
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# UnifiedGPTService 인스턴스 생성
unified_service = UnifiedGPTService()

# 이미지 저장 설정
WEBTOON_IMAGES_FOLDER = os.path.join('static', 'webtoon_images')
if not os.path.exists(WEBTOON_IMAGES_FOLDER):
    os.makedirs(WEBTOON_IMAGES_FOLDER)
    print(f"📁 웹툰 이미지 저장 폴더 생성: {WEBTOON_IMAGES_FOLDER}")

def save_dalle_image_to_local(dalle_url, image_id):
    """DALL-E 이미지를 로컬에 저장하고 로컬 URL 반환"""
    try:
        print(f"💾 이미지 로컬 저장 시작: {dalle_url[:60]}...")
        
        # 이미지 다운로드
        response = requests.get(dalle_url, timeout=60)
        response.raise_for_status()
        
        # 파일명 생성
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"webtoon_{image_id}_{timestamp}_{uuid.uuid4().hex[:8]}.png"
        filepath = os.path.join(WEBTOON_IMAGES_FOLDER, filename)
        
        # 파일 저장
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        # 로컬 URL 생성
        local_url = f"/static/webtoon_images/{filename}"
        
        print(f"✅ 이미지 로컬 저장 완료: {local_url}")
        return local_url
        
    except Exception as e:
        print(f"❌ 이미지 로컬 저장 실패: {e}")
        return None

def build_character_description(character_info):
    """캐릭터 정보 기반 설명 생성 - 예전 방식 적용 🔑"""
    if not character_info:
        return "cute Korean young person with expressive eyes, casual modern clothing"
    
    print(f"🎭 캐릭터 정보 분석: {character_info}")
    
    # 🔑 예전 방식: description + base_images 활용 (핵심!)
    if isinstance(character_info, dict) and 'description' in character_info:
        description_text = character_info['description']
        result = f"Korean webtoon character: {description_text}"
        
        # 🔑 base_images가 있으면 캐릭터 일관성 강조 (예전 방식의 핵심!)
        if 'base_images' in character_info and character_info['base_images']:
            print(f"✅ base_images 발견 - 캐릭터 일관성 강화 모드")
            print(f"📸 참고 이미지 개수: {len(character_info['base_images'])}")
            
            # 캐릭터 일관성을 매우 강하게 강조
            result += ", CRITICAL: MAINTAIN EXACT SAME CHARACTER APPEARANCE as reference images"
            result += ", IDENTICAL facial features, same hair style and color, same clothing style"
            result += ", CONSISTENT character design throughout all emotions and scenes"
            result += ", preserve character's unique visual identity and distinctive features"
            result += ", same proportions, same art style as established character"
            result += ", CHARACTER CONSISTENCY IS MOST IMPORTANT - do not deviate from established look"
            
            # 감정만 변경, 외모는 동일하게 유지
            result += ", ONLY change facial expression for emotion, keep everything else identical"
            
        else:
            print(f"⚠️ base_images 없음 - 기본 캐릭터 생성 모드")
        
        result += ", clean line art, detailed facial features, expressive eyes"
        result += ", consistent character design, professional webtoon illustration style"
        return result
    
    # 🔄 예전 방식: 구조화된 데이터 처리 개선
    description_parts = ["Korean webtoon character"]
    
    # base_images가 있으면 일관성 강조
    if isinstance(character_info, dict) and 'base_images' in character_info:
        description_parts.append("maintaining exact same appearance as reference images")
        description_parts.append("consistent facial features and design")
    
    if character_info.get('age'):
        description_parts.append(f"{character_info['age']} years old")
    if character_info.get('hair_color'):
        description_parts.append(f"{character_info['hair_color']} hair")
    if character_info.get('clothing_style'):
        description_parts.append(f"wearing {character_info['clothing_style']}")
    
    description_parts.extend([
        "detailed and expressive features",
        "professional webtoon illustration style"
    ])
    
    return ", ".join(description_parts)

def generate_webtoon_image(panel_info, character_info, emotion):
    """캐릭터 정보 기반 웹툰 이미지 생성 - 예전 방식 강화 🔑"""
    try:
        print(f"🎭 DALL-E 이미지 생성 - 감정: {emotion}")
        print(f"📋 캐릭터 정보: {character_info}")
        
        # 🔑 예전 방식: 캐릭터 설명 강화
        character_description = build_character_description(character_info)
        print(f"🎨 생성된 캐릭터 설명: {character_description[:200]}...")
        
        # 🔑 예전 방식: 감정별 표현 더 상세하게
        emotion_expressions = {
            "기쁨": "bright genuine smile, sparkling eyes, cheerful body language, uplifted posture",
            "슬픔": "sad expression, downcast eyes, melancholic mood, slightly drooped shoulders",
            "분노": "angry expression, furrowed brows, tense posture, clenched features",
            "불안": "worried expression, nervous gesture, anxious mood, tense body language",
            "평온": "calm peaceful expression, relaxed demeanor, serene posture, gentle features",
            "중립": "neutral natural expression, relaxed natural pose, comfortable stance"
        }
        
        emotion_detail = emotion_expressions.get(emotion, "natural expression")
        
        # 🔑 예전 방식: 더 강화된 가로형 웹툰 프롬프트
        prompt = f"""
        Create a high-quality Korean webtoon/manhwa style illustration:

        SCENE DESCRIPTION (MOST IMPORTANT):
        {panel_info['scene']}

        CHARACTER DESCRIPTION (CRITICAL - MAINTAIN CONSISTENCY):
        {character_description}

        EMOTION & EXPRESSION (CHANGE ONLY THIS):
        {emotion} - {emotion_detail}

        DIALOGUE:
        "{panel_info['dialogue']}"

        ARTISTIC REQUIREMENTS:
        - Korean manhwa/webtoon art style with clean digital line art
        - HORIZONTAL comic panel format (landscape orientation) - WIDE FORMAT
        - Professional comic book illustration quality
        - Soft cell shading with pastel color palette
        - Character's {emotion} emotion clearly visible in facial expressions
        - Include a speech bubble with the dialogue text
        - Focus on creating the exact scene described above
        - Detailed background that matches the scene setting
        - Wide panel composition perfect for landscape viewing
        - Modern digital webtoon aesthetic optimized for horizontal layout

        CRITICAL CHARACTER CONSISTENCY RULES:
        - If character reference images exist, MAINTAIN EXACT SAME APPEARANCE
        - ONLY change facial expression for the {emotion} emotion
        - Keep hair style, clothing, proportions, and all visual features IDENTICAL
        - Preserve the established character design throughout
        - Character consistency is MORE IMPORTANT than scene details

        Quality: High-definition professional webtoon illustration
        Style: Clean, modern Korean webtoon/manhwa in horizontal format
        Focus: Character consistency + emotion expression + scene storytelling
        """
        
        print(f"📤 DALL-E 프롬프트 (처음 300자): {prompt[:300]}...")
        
        # DALL-E API 호출
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",  # 가로형
            quality="hd",
            n=1,
        )
        
        temp_url = response.data[0].url
        print(f"✅ DALL-E 임시 URL 생성: {temp_url[:60]}...")
        
        return temp_url
        
    except Exception as e:
        print(f"❌ DALL-E 이미지 생성 실패: {e}")
        raise e

@diary_bp.route('/api/diary/analyze', methods=['POST'])
def analyze_diary():
    """일기 분석 API (기존 호환)"""
    try:
        data = request.json
        diary_text = data.get('text', '')
        
        if not diary_text:
            return jsonify({"error": "일기 내용이 없습니다."}), 400
        
        print(f"일기 분석 요청: {diary_text[:50]}...")
        
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
        
        analysis = json.loads(response.choices[0].message.content)
        analysis["analysis_success"] = True
        
        print(f"분석 완료: {analysis['emotion']}")
        return jsonify(analysis)
        
    except Exception as gpt_error:
        print(f"GPT 분석 실패: {gpt_error}")
        # GPT 실패 시 기본 응답
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

@diary_bp.route('/api/diary/analyze_with_webtoon', methods=['POST'])
def analyze_with_webtoon():
    """감정 분석 + 웹툰 스토리 생성 (텍스트만)"""
    try:
        data = request.json
        diary_text = data.get('text', '')
        
        if not diary_text:
            return jsonify({"error": "일기 내용이 없습니다."}), 400
        
        print(f"통합 분석 요청: {diary_text[:50]}...")
        
        # 1. 감정 분석
        analysis = unified_service.analyze_diary(diary_text)
        print(f"감정 분석 완료: {analysis['emotion']}")
        
        # 2. 웹툰 스토리 생성 (1컷만)
        story_result = unified_service.create_webtoon_story(analysis, "나나")
        
        if story_result and 'panels' in story_result and len(story_result['panels']) > 0:
            daily_panel = story_result['panels'][0]
            story = {'panels': [daily_panel]}
            print("웹툰 스토리 생성 완료")
        else:
            story = {
                'panels': [{
                    'scene': f"{analysis['emotion']} 감정이 느껴지는 하루",
                    'dialogue': analysis.get('one_line', '오늘 하루를 마무리합니다.')
                }]
            }
        
        result = {
            'analysis': analysis,
            'story': story,
            'diary_text': diary_text,
            'timestamp': datetime.now().isoformat()
        }
        
        print("✅ 통합 분석 완료!")
        return jsonify(result)
        
    except Exception as e:
        print(f"통합 분석 오류: {e}")
        return jsonify({
            "error": f"분석 중 오류가 발생했습니다: {str(e)}"
        }), 500

@diary_bp.route('/api/diary/analyze_with_webtoon_image', methods=['POST'])
def analyze_with_webtoon_image():
    """감정 분석 + 웹툰 스토리 + 이미지 생성 - 예전 방식 적용 🔑"""
    try:
        data = request.json
        diary_text = data.get('text', '')
        character_info = data.get('character_info', {})
        user_id = data.get('user_id', data.get('userId', 'anonymous'))  # 🔄 예전 방식 호환
        
        if not diary_text:
            return jsonify({"error": "일기 내용이 없습니다."}), 400
        
        print(f"🔥 예전 방식 적용 통합 웹툰 생성: {diary_text[:50]}...")
        print(f"📝 사용자: {user_id}")
        print(f"🎭 캐릭터 정보 구조: {character_info}")
        
        # 🔑 예전 방식: character_info 구조 확인 및 로깅
        if character_info:
            print(f"✅ 캐릭터 정보 발견:")
            print(f"  - description: {character_info.get('description', 'None')}")
            print(f"  - base_images: {bool(character_info.get('base_images'))}")
            if character_info.get('base_images'):
                print(f"  - base_images 개수: {len(character_info['base_images'])}")
                print(f"  - 감정 종류: {list(character_info['base_images'].keys())}")
        else:
            print(f"⚠️ 캐릭터 정보 없음 - 기본 웹툰 생성")
        
        # 1. 감정 분석
        analysis = unified_service.analyze_diary(diary_text)
        print(f"감정 분석 완료: {analysis['emotion']}")
        
        # 2. 웹툰 스토리 생성
        story_result = unified_service.create_webtoon_story(analysis, "나나")
        
        if story_result and 'panels' in story_result and len(story_result['panels']) > 0:
            panel = story_result['panels'][0]
            
            # 3. 웹툰 ID 생성
            webtoon_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{analysis['emotion']}"
            
            # 🔑 예전 방식: 캐릭터 정보가 있을 때만 이미지 생성
            if character_info and (character_info.get('description') or character_info.get('base_images')):
                # 4. DALL-E 이미지 생성 + 로컬 저장
                try:
                    print("🎨 캐릭터 기반 DALL-E 이미지 생성 시작...")
                    print(f"📋 장면: {panel['scene'][:100]}...")
                    print(f"💬 대사: {panel['dialogue'][:50]}...")
                    
                    # 🔑 예전 방식: 강화된 캐릭터 정보로 이미지 생성
                    dalle_temp_url = generate_webtoon_image(
                        panel, 
                        character_info, 
                        analysis['emotion']
                    )
                    
                    if dalle_temp_url:
                        print("✅ DALL-E 이미지 생성 성공!")
                        
                        # 로컬 서버에 저장
                        local_image_url = save_dalle_image_to_local(dalle_temp_url, webtoon_id)
                        
                        # 최종 이미지 URL 결정
                        final_image_url = local_image_url if local_image_url else dalle_temp_url
                        
                        panel['image_url'] = final_image_url
                        panel['dalle_temp_url'] = dalle_temp_url  # 참고용
                        panel['local_image_url'] = local_image_url  # 로컬 URL
                        panel['image_saved_locally'] = bool(local_image_url)
                        panel['character_used'] = True  # 🔄 예전 방식: 캐릭터 사용 표시
                        
                        print("🎉 캐릭터 기반 이미지 로컬 저장 완료!")
                        
                    else:
                        raise Exception("DALL-E 이미지 생성 실패")
                        
                except Exception as img_error:
                    print(f"❌ 이미지 생성/저장 실패: {img_error}")
                    panel['image_url'] = None
                    panel['image_error'] = str(img_error)
                    panel['image_saved_locally'] = False
                    panel['character_used'] = False
            else:
                print("⚠️ 캐릭터 정보 부족 - 이미지 생성 스킵")
                panel['image_url'] = None
                panel['image_saved_locally'] = False
                panel['character_used'] = False
            
            story = {'panels': [panel]}
        else:
            story = {
                'panels': [{
                    'scene': f"{analysis['emotion']} 감정이 느껴지는 하루",
                    'dialogue': analysis.get('one_line', '오늘 하루를 마무리합니다.'),
                    'image_url': None,
                    'image_saved_locally': False,
                    'character_used': False
                }]
            }
        
        # 5. Firebase에 저장 (선택사항)
        firebase_doc_id = None
        try:
            if user_id != 'anonymous':
                firebase_doc_id = save_to_firebase(
                    user_id, 
                    diary_text, 
                    analysis, 
                    story['panels'][0].get('image_url'),
                    webtoon_id
                )
                print("✅ Firebase 저장 완료")
        except Exception as firebase_error:
            print(f"⚠️ Firebase 저장 실패: {firebase_error}")
        
        # 🔄 예전 방식: 통합 결과 반환 (호환성 개선)
        result = {
            'analysis': analysis,
            'story': story,
            'diary_text': diary_text,
            'character_info': character_info,
            'webtoon_id': webtoon_id,
            'firebase_doc_id': firebase_doc_id,
            'user_id': user_id,
            'character_used': story['panels'][0].get('character_used', False),  # 🔄 예전 방식
            'timestamp': datetime.now().isoformat()
        }
        
        print("✅ 예전 방식 적용 통합 웹툰 생성 완료!")
        print(f"🎭 캐릭터 사용 여부: {result['character_used']}")
        return jsonify(result)
        
    except Exception as e:
        print(f"통합 시스템 오류: {e}")
        return jsonify({
            "error": f"웹툰 생성 중 오류가 발생했습니다: {str(e)}"
        }), 500

@diary_bp.route('/api/diary/generate_weekly_narrative', methods=['POST'])
def generate_weekly_narrative():
    """🔥 새로운 API: 주간 내레이션 생성 (이미지 생성 없음, 비용 절약!)"""
    try:
        data = request.json
        daily_analyses = data.get('daily_analyses', [])
        
        if len(daily_analyses) < 7:
            return jsonify({"error": "7일치 데이터가 필요합니다."}), 400
        
        print(f"📝 주간 내레이션 생성 요청: {len(daily_analyses)}일치")
        print(f"💰 비용 절약 모드: 텍스트 내레이션만 생성")
        
        # UnifiedGPTService 사용해서 텍스트 내레이션만 생성
        narrative_result = unified_service.create_weekly_narrative(daily_analyses)
        
        print("✅ 주간 내레이션 생성 완료!")
        print(f"📊 주요 감정: {narrative_result.get('week_dominant_emotion', '알 수 없음')}")
        print(f"💰 생성 비용: {narrative_result.get('generation_cost', '저렴!')}")
        
        return jsonify(narrative_result)
        
    except Exception as e:
        print(f"❌ 주간 내레이션 생성 오류: {e}")
        return jsonify({
            "error": f"내레이션 생성 중 오류가 발생했습니다: {str(e)}"
        }), 500

def save_to_firebase(user_id, diary_text, analysis, image_url, webtoon_id):
    """Firebase Firestore에 웹툰 데이터 저장"""
    try:
        date = datetime.now().strftime('%Y-%m-%d')
        doc_id = f"{user_id}_{date}_{webtoon_id}"
        
        diary_data = {
            "userId": user_id,
            "date": date,
            "diary": diary_text,
            "emotion": analysis['emotion'],
            "emotionIntensity": analysis.get('emotion_intensity', 5),
            "summary": analysis.get('summary', ''),
            "keywords": analysis.get('keywords', []),
            "oneLine": analysis.get('one_line', ''),
            "imageUrl": image_url,  # 로컬 URL 또는 DALL-E URL
            "webtoonId": webtoon_id,
            "imageSavedLocally": bool(image_url and '/static/' in str(image_url)),
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        db.collection("diaries").document(doc_id).set(diary_data)
        print(f"✅ Firebase 저장 성공: {doc_id}")
        
        return doc_id
        
    except Exception as e:
        print(f"❌ Firebase 저장 실패: {e}")
        raise e

@diary_bp.route('/api/diary/save', methods=['POST'])
def save_diary():
    """일기 저장 API (Firebase + 로컬 하이브리드)"""
    try:
        data = request.get_json()
        user_id = data.get("userId", "anonymous")
        date = data.get("date", datetime.now().strftime('%Y-%m-%d'))
        diary = data.get("diary", "")
        emotion = data.get("emotion", "")
        intensity = data.get("emotionIntensity", 5)
        summary = data.get("summary", "")
        keywords = data.get("keywords", [])
        image_url = data.get("imageUrl", "")
        
        # Firebase에 저장
        doc_id = f"{user_id}_{date}"
        diary_data = {
            "userId": user_id,
            "date": date,
            "diary": diary,
            "emotion": emotion,
            "emotionIntensity": intensity,
            "summary": summary,
            "keywords": keywords,
            "imageUrl": image_url,
            "createdAt": datetime.now().isoformat()
        }
        
        db.collection("diaries").document(doc_id).set(diary_data)
        
        # 로컬 백업 저장 (선택사항)
        try:
            backup_file = os.path.join('static', 'diary_backup.json')
            
            try:
                with open(backup_file, 'r', encoding='utf-8') as f:
                    all_diaries = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                all_diaries = []
            
            diary_data['backup_id'] = doc_id
            all_diaries.append(diary_data)
            
            with open(backup_file, 'w', encoding='utf-8') as f:
                json.dump(all_diaries, f, ensure_ascii=False, indent=2)
                
            print("✅ 로컬 백업 저장 완료")
        except Exception as backup_error:
            print(f"⚠️ 로컬 백업 실패: {backup_error}")
        
        print(f"✅ 일기 저장 완료: {doc_id}")
        return jsonify({"message": "일기 저장 성공!", "doc_id": doc_id}), 200
        
    except Exception as e:
        print(f"일기 저장 오류: {e}")
        return jsonify({"error": str(e)}), 500

@diary_bp.route('/api/diary/list', methods=['GET'])
def get_diary_list():
    """일기 목록 조회 API (Firebase)"""
    try:
        user_id = request.args.get("userId", "anonymous")
        limit = int(request.args.get("limit", 50))
        
        # Firebase에서 사용자 일기 조회
        docs = db.collection("diaries").where("userId", "==", user_id).limit(limit).stream()
        
        diaries = []
        for doc in docs:
            diary_data = doc.to_dict()
            diary_data['id'] = doc.id
            diaries.append(diary_data)
        
        # 날짜순 정렬
        diaries.sort(key=lambda x: x.get('date', ''), reverse=True)
        
        return jsonify({
            "status": "success",
            "diaries": diaries,
            "count": len(diaries),
            "user_id": user_id
        })
        
    except Exception as e:
        print(f"일기 목록 조회 오류: {e}")
        return jsonify({"error": str(e)}), 500

# 기존 주간 웹툰 API (8컷 이미지 생성 - 비용 高)
@diary_bp.route('/api/diary/generate_weekly_webtoon', methods=['POST'])
def generate_weekly_webtoon():
    """7일치 웹툰을 연결된 주간 스토리로 생성 (Firebase + 로컬 저장) - 기존 API"""
    try:
        data = request.json
        weekly_data = data.get('weekly_data', [])
        character_info = data.get('character_info', {})
        user_id = data.get('userId', 'anonymous')
        generate_images = data.get('generate_images', False)
        
        if len(weekly_data) < 7:
            return jsonify({"error": "일주일치 데이터가 부족합니다."}), 400
        
        print(f"📅 기존 주간 웹툰 생성: {len(weekly_data)}일치, 사용자: {user_id}")
        print(f"🎨 이미지 생성: {generate_images}")
        print(f"💰 예상 비용: {'높음 (8컷 이미지 생성)' if generate_images else '낮음 (텍스트만)'}")
        
        # 주간 분석 데이터 생성
        daily_analyses = []
        for day_data in weekly_data:
            emotion_text = day_data.get('emotion', '평온')
            emotion = emotion_text.split()[-1] if ' ' in emotion_text else emotion_text
            
            analysis = {
                'emotion': emotion,
                'emotion_intensity': day_data.get('emotion_intensity', 5),
                'summary': day_data.get('inputText', '')[:100],
                'one_line': day_data.get('scene', day_data.get('inputText', ''))[:50],
                'keywords': [],
                'day_number': day_data.get('dayNumber', len(daily_analyses) + 1)
            }
            daily_analyses.append(analysis)
        
        # 주간 스토리 생성
        weekly_story_result = unified_service.create_weekly_story(daily_analyses)
        
        # 8컷 패널 생성
        weekly_panels = create_weekly_panels_with_firebase(
            weekly_story_result, 
            daily_analyses, 
            character_info, 
            generate_images,
            user_id
        )
        
        # 주간 통계
        weekly_stats = generate_weekly_stats(daily_analyses)
        
        # Firebase에 주간 웹툰 저장
        weekly_doc_id = None
        try:
            if user_id != 'anonymous':
                weekly_doc_id = save_weekly_webtoon_to_firebase(
                    user_id,
                    weekly_story_result,
                    weekly_panels,
                    weekly_stats,
                    daily_analyses
                )
        except Exception as firebase_error:
            print(f"⚠️ 주간 웹툰 Firebase 저장 실패: {firebase_error}")
        
        result = {
            'weekly_story': weekly_story_result,
            'panels': weekly_panels,
            'stats': weekly_stats,
            'emotion_journey': [d['emotion'] for d in daily_analyses],
            'total_days': len(daily_analyses),
            'images_saved_locally': sum(1 for p in weekly_panels if p.get('image_saved_locally')),
            'firebase_doc_id': weekly_doc_id,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat()
        }
        
        print("✅ 기존 주간 웹툰 생성 완료!")
        return jsonify(result)
        
    except Exception as e:
        print(f"주간 웹툰 생성 오류: {e}")
        return jsonify({
            "error": f"주간 웹툰 생성 중 오류가 발생했습니다: {str(e)}"
        }), 500

def create_weekly_panels_with_firebase(weekly_story_result, daily_analyses, character_info, generate_images, user_id):
    """주간 패널 생성 (Firebase 연동)"""
    panels = []
    
    panel_templates = [
        {"title": "월요일의 시작", "focus": "week_start"},
        {"title": "화요일의 전개", "focus": "daily_progress"}, 
        {"title": "수요일의 변화", "focus": "mid_week"},
        {"title": "목요일의 도전", "focus": "challenges"},
        {"title": "금요일의 클라이맥스", "focus": "climax"},
        {"title": "토요일의 해결", "focus": "resolution"},
        {"title": "일요일의 마무리", "focus": "week_end"},
        {"title": "한 주의 성장", "focus": "growth_summary"}
    ]
    
    for i, template in enumerate(panel_templates):
        day_index = min(i, len(daily_analyses) - 1)
        day_data = daily_analyses[day_index] if i < 7 else daily_analyses[-1]
        
        panel = {
            "panel_number": i + 1,
            "title": template["title"],
            "scene": f"{template['title']} - {day_data['one_line']}",
            "dialogue": f"Day {day_index + 1}: {day_data['emotion']}한 하루였어요.",
            "emotion": day_data['emotion'],
            "day_reference": day_index + 1 if i < 7 else "전체",
            "focus_type": template["focus"],
            "image_url": None,
            "image_saved_locally": False
        }
        
        # 이미지 생성 (중요한 패널만)
        if generate_images and character_info and i in [0, 3, 6, 7]:
            try:
                week_id = f"{user_id}_week_{datetime.now().strftime('%Y%m%d_%H%M%S')}_panel_{i+1}"
                
                dalle_url = generate_webtoon_image(panel, character_info, day_data['emotion'])
                if dalle_url:
                    local_url = save_dalle_image_to_local(dalle_url, week_id)
                    if local_url:
                        panel['image_url'] = local_url
                        panel['image_saved_locally'] = True
                        print(f"✅ 주간 패널 {i+1} 이미지 저장 완료")
                    
            except Exception as e:
                print(f"❌ 주간 패널 {i+1} 이미지 생성 실패: {e}")
        
        panels.append(panel)
    
    return panels

def generate_weekly_stats(daily_analyses):
    """주간 통계 생성"""
    emotions = [d['emotion'] for d in daily_analyses]
    emotion_counts = {}
    
    for emotion in emotions:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1]) if emotion_counts else ("평온", 1)
    
    return {
        'dominant_emotion': dominant_emotion[0],
        'emotion_distribution': emotion_counts,
        'emotional_variance': len(set(emotions)),
        'week_summary': f"이번 주는 주로 {dominant_emotion[0]} 감정이 지배적이었습니다.",
        'growth_message': "일주일간의 감정 여정을 통해 성장했습니다."
    }

def save_weekly_webtoon_to_firebase(user_id, weekly_story, panels, stats, daily_analyses):
    """주간 웹툰을 Firebase에 저장"""
    try:
        week_start = datetime.now().strftime('%Y-%m-%d')
        doc_id = f"{user_id}_weekly_{week_start}"
        
        weekly_data = {
            "userId": user_id,
            "weekStart": week_start,
            "weeklyStory": weekly_story,
            "panels": panels,
            "stats": stats,
            "dailyAnalyses": daily_analyses,
            "emotionJourney": [d['emotion'] for d in daily_analyses],
            "totalDays": len(daily_analyses),
            "createdAt": datetime.now().isoformat(),
            "type": "weekly_webtoon"
        }
        
        db.collection("weekly_webtoons").document(doc_id).set(weekly_data)
        print(f"✅ 주간 웹툰 Firebase 저장 성공: {doc_id}")
        
        return doc_id
        
    except Exception as e:
        print(f"❌ 주간 웹툰 Firebase 저장 실패: {e}")
        raise e