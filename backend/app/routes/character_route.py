from flask import Blueprint, request, jsonify, send_from_directory
from openai import OpenAI
import os
import json
import requests
import uuid
from datetime import datetime
from dotenv import load_dotenv
from config.firebase_config import db  # Firebase 연동

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

character_bp = Blueprint("character", __name__)

# 캐릭터 이미지 저장 설정
CHARACTER_IMAGES_FOLDER = os.path.join('static', 'character_images')
if not os.path.exists(CHARACTER_IMAGES_FOLDER):
    os.makedirs(CHARACTER_IMAGES_FOLDER)
    print(f"📁 캐릭터 이미지 저장 폴더 생성: {CHARACTER_IMAGES_FOLDER}")

def save_character_image_to_local(dalle_url, character_id, emotion="default"):
    """캐릭터 이미지를 로컬에 저장"""
    try:
        print(f"💾 캐릭터 이미지 저장: {emotion}")
        
        response = requests.get(dalle_url, timeout=60)
        response.raise_for_status()
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"character_{character_id}_{emotion}_{timestamp}_{uuid.uuid4().hex[:8]}.png"
        filepath = os.path.join(CHARACTER_IMAGES_FOLDER, filename)
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        local_url = f"/static/character_images/{filename}"
        print(f"✅ 캐릭터 이미지 저장 완료: {local_url}")
        
        return local_url
        
    except Exception as e:
        print(f"❌ 캐릭터 이미지 저장 실패: {e}")
        return None

@character_bp.route("/api/generate_character", methods=["POST"])
def generate_character():
    """사용자 맞춤형 캐릭터 생성 + 로컬 저장 - 예전 방식 강화 🔑"""
    try:
        data = request.get_json()
        print(f"🎭 캐릭터 생성 요청 데이터: {data}")
        
        prompt = data.get("prompt", "")
        emotion = data.get("emotion", "중립")
        character_description = data.get("character_description", "")
        user_id = data.get("userId", "anonymous")
        save_locally = data.get("save_locally", True)
        method = data.get("method", "description")  # 🔄 예전 방식: 생성 방법 추가
        
        if not prompt:
            return jsonify({"error": "프롬프트가 없습니다."}), 400
        
        # 🔑 예전 방식: 더 강화된 일관성 프롬프트
        enhanced_prompt = f"""
        Create a consistent Korean webtoon/manhwa character:
        
        CHARACTER DESCRIPTION:
        {prompt}
        
        CRITICAL REQUIREMENTS FOR CHARACTER CONSISTENCY:
        - EXACT SAME character in every generation
        - IDENTICAL facial features, hair style, clothing
        - CONSISTENT proportions and art style
        - REPRODUCIBLE character design
        - Clean digital line art, webtoon style
        - Character facing forward, clear view
        - Pure white background, no shadows
        - Professional manhwa illustration quality
        
        EMOTION EXPRESSION:
        - Show {emotion} emotion in facial expression ONLY
        - Keep ALL other features identical (hair, clothes, proportions)
        - Natural and expressive {emotion} feeling
        
        TECHNICAL SPECS:
        - High-quality digital illustration
        - Clean lines, cell shading
        - Character design suitable for series consistency
        - Professional webtoon artist quality
        
        This character will be used for consistent storytelling across multiple panels.
        CONSISTENCY IS THE MOST IMPORTANT FACTOR.
        """
        
        print(f"🎨 강화된 DALL-E 프롬프트 (처음 200자): {enhanced_prompt[:200]}...")
        
        # DALL-E 이미지 생성
        response = client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        dalle_temp_url = response.data[0].url
        print(f"✅ DALL-E 임시 URL 생성: {dalle_temp_url[:50]}...")
        
        # 로컬 저장 처리
        final_image_url = dalle_temp_url  # 기본값
        image_saved_locally = False
        character_id = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if save_locally:
            local_url = save_character_image_to_local(dalle_temp_url, character_id, emotion)
            
            if local_url:
                final_image_url = local_url
                image_saved_locally = True
                print("🎉 캐릭터 이미지 로컬 저장 완료!")
            else:
                print("⚠️ 로컬 저장 실패, DALL-E URL 사용")
        
        # 🔄 예전 방식: 응답 데이터 구조 개선
        result = {
            "url": final_image_url,
            "emotion": emotion,
            "character_description": character_description,
            "dalle_temp_url": dalle_temp_url,
            "local_url": final_image_url if image_saved_locally else None,
            "image_saved_locally": image_saved_locally,
            "character_id": character_id,
            "method": method,  # 🔄 예전 방식: 생성 방법
            "enhanced_prompt": enhanced_prompt,  # 프롬프트 저장 (디버깅용)
            "created_at": datetime.now().isoformat()
        }
        
        print(f"✅ 캐릭터 생성 완료 (로컬 저장: {image_saved_locally})")
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ 캐릭터 생성 에러: {type(e).__name__}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@character_bp.route("/api/generate_character_emotions", methods=["POST"])
def generate_character_emotions():
    """모든 감정별 캐릭터 이미지 생성 - 예전 방식 강화 🔑"""
    try:
        data = request.get_json()
        base_prompt = data.get("prompt", "")
        user_id = data.get("userId", "anonymous")
        character_description = data.get("character_description", "")
        method = data.get("method", "description")  # 🔄 예전 방식
        
        if not base_prompt:
            return jsonify({"error": "프롬프트가 없습니다."}), 400
        
        emotions = ["기쁨", "슬픔", "분노", "불안", "평온", "중립"]
        character_id = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        emotion_images = {}
        generated_count = 0
        generation_details = {}  # 🔄 예전 방식: 생성 세부사항 추적
        
        print(f"🎭 {len(emotions)}가지 감정 캐릭터 생성 시작...")
        print(f"📋 기본 설명: {character_description}")
        print(f"🔧 생성 방법: {method}")
        
        # 🔑 예전 방식: 기본 캐릭터 특성 추출 및 강화
        base_character_prompt = f"""
        Create a consistent Korean webtoon/manhwa character series:
        
        BASE CHARACTER:
        {base_prompt}
        
        CHARACTER CONSISTENCY RULES:
        - IDENTICAL character appearance across ALL emotions
        - SAME facial structure, hair style, clothing, proportions
        - ONLY facial expression changes for each emotion
        - Professional webtoon art style
        - Clean digital line art, cell shading
        - Pure white background
        - Character facing forward, clear visibility
        - High-quality manhwa illustration
        
        CRITICAL: This is a character series - CONSISTENCY IS ESSENTIAL
        """
        
        for emotion in emotions:
            try:
                # 🔑 예전 방식: 각 감정별 강화된 프롬프트
                emotion_expressions = {
                    "기쁨": "bright genuine smile, sparkling happy eyes, cheerful expression, joyful energy",
                    "슬픔": "sad downcast expression, melancholic eyes, gentle frown, sorrowful mood",
                    "분노": "angry furrowed brow, intense eyes, stern mouth, frustrated expression",
                    "불안": "worried anxious eyes, nervous expression, concerned look, uneasy feeling",
                    "평온": "calm peaceful expression, serene eyes, gentle smile, relaxed demeanor",
                    "중립": "neutral natural expression, relaxed face, comfortable look, natural pose"
                }
                
                emotion_detail = emotion_expressions.get(emotion, "natural expression")
                
                emotion_prompt = f"""
                {base_character_prompt}
                
                EMOTION TO EXPRESS: {emotion}
                FACIAL EXPRESSION: {emotion_detail}
                
                SPECIFIC REQUIREMENTS:
                - Show {emotion} emotion in face ONLY
                - Keep EVERYTHING else identical (hair, clothes, body, style)
                - Consistent with other emotions in this character series
                - Natural and authentic {emotion} expression
                - Professional webtoon quality
                
                Remember: This is emotion #{emotions.index(emotion) + 1} of {len(emotions)} in a consistent character series.
                """
                
                print(f"  🎨 {emotion} 표정 생성 중...")
                print(f"     감정 표현: {emotion_detail}")
                
                response = client.images.generate(
                    model="dall-e-3",
                    prompt=emotion_prompt,
                    size="1024x1024",
                    quality="standard",
                    n=1,
                )
                
                dalle_url = response.data[0].url
                local_url = save_character_image_to_local(dalle_url, character_id, emotion)
                
                if local_url:
                    emotion_images[emotion] = local_url
                    generated_count += 1
                    print(f"  ✅ {emotion} 표정 완료 - 로컬 저장 성공")
                else:
                    emotion_images[emotion] = dalle_url  # 로컬 저장 실패시 DALL-E URL
                    print(f"  ⚠️ {emotion} 표정 완료 - 로컬 저장 실패, DALL-E URL 사용")
                
                # 🔄 예전 방식: 생성 세부사항 저장
                generation_details[emotion] = {
                    "dalle_url": dalle_url,
                    "local_url": local_url,
                    "prompt_used": emotion_prompt[:100] + "...",  # 프롬프트 일부만 저장
                    "generated_at": datetime.now().isoformat(),
                    "success": True
                }
                
            except Exception as emotion_error:
                print(f"  ❌ {emotion} 표정 생성 실패: {emotion_error}")
                emotion_images[emotion] = None
                generation_details[emotion] = {
                    "error": str(emotion_error),
                    "success": False,
                    "generated_at": datetime.now().isoformat()
                }
        
        # 🔄 예전 방식: 캐릭터 데이터 구성 강화
        character_data = {
            "images": emotion_images,
            "description": character_description,
            "method": method,  # 🔄 예전 방식: photo vs description
            "character_id": character_id,
            "base_prompt": base_prompt,  # 🔄 원본 프롬프트 저장
            "created_at": datetime.now().isoformat(),
            "total_emotions": len(emotions),
            "generated_count": generated_count,
            "success_rate": f"{generated_count}/{len(emotions)}",
            "images_saved_locally": generated_count > 0,
            "generation_details": generation_details,  # 🔄 상세 생성 정보
            "version": "enhanced_consistency_v2"  # 🔄 버전 추적
        }
        
        print(f"🔍 캐릭터 데이터 구조 확인:")
        print(f"  - 설명: {character_data['description']}")
        print(f"  - 방법: {character_data['method']}")
        print(f"  - 성공률: {character_data['success_rate']}")
        print(f"  - 이미지 개수: {len([url for url in emotion_images.values() if url])}")
        
        # Firebase에 자동 저장
        try:
            db.collection("characters").document(user_id).set(character_data)
            print(f"✅ 캐릭터 세트 Firebase 자동 저장 완료")
        except Exception as firebase_error:
            print(f"⚠️ Firebase 자동 저장 실패: {firebase_error}")
        
        # 로컬 백업 자동 저장
        try:
            characters_file = os.path.join('static', 'characters_backup.json')
            
            try:
                with open(characters_file, 'r', encoding='utf-8') as f:
                    all_characters = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                all_characters = {}
            
            all_characters[user_id] = character_data
            
            with open(characters_file, 'w', encoding='utf-8') as f:
                json.dump(all_characters, f, ensure_ascii=False, indent=2)
                
            print(f"✅ 캐릭터 세트 로컬 백업 완료")
        except Exception as backup_error:
            print(f"⚠️ 로컬 백업 실패: {backup_error}")
        
        # 🔄 예전 방식: 결과 구조 개선
        result = {
            "character": character_data,
            "success": generated_count > 0,
            "message": f"{generated_count}/{len(emotions)}개 감정 표정 생성 완료",
            "character_preview": {  # 🔄 미리보기 정보
                "method": method,
                "description": character_description,
                "available_emotions": [emotion for emotion, url in emotion_images.items() if url],
                "total_generated": generated_count
            }
        }
        
        print(f"🎉 캐릭터 감정 세트 생성 완료:")
        print(f"   성공: {generated_count}/{len(emotions)}")
        print(f"   방법: {method}")
        print(f"   생성된 감정들: {result['character_preview']['available_emotions']}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ 캐릭터 감정 세트 생성 오류: {e}")
        return jsonify({"error": str(e)}), 500

@character_bp.route("/api/save-character", methods=["POST"])
def save_character():
    """Firebase + 로컬 백업으로 캐릭터 저장 - 예전 방식 호환성 🔄"""
    try:
        data = request.get_json()
        user_id = data.get("userId", "anonymous")
        character = data.get("character")
        
        if not character:
            return jsonify({"error": "character 정보가 누락되었습니다."}), 400
        
        # 🔄 예전 방식: 캐릭터 데이터 구조 확인 및 보강
        if not character.get("method"):
            character["method"] = "description"  # 기본값
        if not character.get("version"):
            character["version"] = "legacy_import"
        if not character.get("created_at"):
            character["created_at"] = datetime.now().isoformat()
        
        print(f"💾 캐릭터 저장:")
        print(f"  - 사용자: {user_id}")
        print(f"  - 방법: {character.get('method', 'unknown')}")
        print(f"  - 감정 수: {len(character.get('images', {}))}")
        print(f"  - 설명: {character.get('description', 'no description')[:50]}...")
        
        # Firebase에 저장
        try:
            db.collection("characters").document(user_id).set(character)
            print(f"✅ 캐릭터 Firebase 저장 완료 (userId: {user_id})")
        except Exception as firebase_error:
            print(f"❌ Firebase 저장 실패: {firebase_error}")
            # Firebase 실패시에도 로컬 백업은 시도
        
        # 로컬 백업 저장
        try:
            characters_file = os.path.join('static', 'characters_backup.json')
            
            try:
                with open(characters_file, 'r', encoding='utf-8') as f:
                    all_characters = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                all_characters = {}
            
            all_characters[user_id] = character
            
            with open(characters_file, 'w', encoding='utf-8') as f:
                json.dump(all_characters, f, ensure_ascii=False, indent=2)
                
            print(f"✅ 캐릭터 로컬 백업 저장 완료")
        except Exception as backup_error:
            print(f"⚠️ 로컬 백업 실패: {backup_error}")
        
        return jsonify({"message": "캐릭터 저장 성공!"}), 200
        
    except Exception as e:
        print(f"❌ 캐릭터 저장 오류: {e}")
        return jsonify({"error": str(e)}), 500

@character_bp.route("/api/get-character", methods=["GET"])
def get_character():
    """Firebase에서 캐릭터 불러오기 - 예전 방식 호환성 🔄"""
    try:
        user_id = request.args.get("userId", "anonymous")
        
        print(f"🔍 캐릭터 조회 요청: {user_id}")
        
        # 1순위: Firebase에서 조회
        try:
            doc_ref = db.collection("characters").document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                character_data = doc.to_dict()
                
                # 🔄 예전 방식: 데이터 구조 확인 및 호환성 보장
                if not character_data.get("method"):
                    character_data["method"] = "description"  # 기본값 설정
                
                print(f"✅ 캐릭터 Firebase 조회 성공:")
                print(f"  - 사용자: {user_id}")
                print(f"  - 방법: {character_data.get('method', 'unknown')}")
                print(f"  - 감정 수: {len(character_data.get('images', {}))}")
                print(f"  - 설명: {character_data.get('description', 'no description')[:50]}...")
                
                return jsonify(character_data), 200
        except Exception as firebase_error:
            print(f"⚠️ Firebase 조회 실패: {firebase_error}")
        
        # 2순위: 로컬 백업에서 조회
        try:
            characters_file = os.path.join('static', 'characters_backup.json')
            
            with open(characters_file, 'r', encoding='utf-8') as f:
                all_characters = json.load(f)
            
            if user_id in all_characters:
                character_data = all_characters[user_id]
                
                # 🔄 예전 방식: 호환성 보장
                if not character_data.get("method"):
                    character_data["method"] = "description"
                
                print(f"✅ 캐릭터 로컬 백업 조회 성공: {user_id}")
                return jsonify(character_data), 200
        except (FileNotFoundError, json.JSONDecodeError) as backup_error:
            print(f"⚠️ 로컬 백업 조회 실패: {backup_error}")
        
        print(f"❌ 캐릭터 없음: {user_id}")
        return jsonify({"error": "캐릭터가 존재하지 않습니다."}), 404
            
    except Exception as e:
        print(f"❌ 캐릭터 불러오기 오류: {e}")
        return jsonify({"error": str(e)}), 500

@character_bp.route("/api/generate_character", methods=["GET"])
def test_generate_character():
    """테스트 라우트"""
    return jsonify({
        "message": "캐릭터 생성 API가 작동 중입니다. POST 요청을 사용하세요.",
        "version": "enhanced_consistency_v2",
        "features": ["일관성 강화", "base_images 지원", "예전 방식 호환성"]
    })