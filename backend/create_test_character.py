# create_test_character.py 파일로 저장
import json
import os
from datetime import datetime

def create_test_character():
    user_id = "6YsP19kDbnf7ZuszKfb5LYFKaFL2"
    
    test_character = {
        "images": {
            "기쁨": "https://via.placeholder.com/150?text=기쁨",
            "슬픔": "https://via.placeholder.com/150?text=슬픔", 
            "분노": "https://via.placeholder.com/150?text=분노",
            "불안": "https://via.placeholder.com/150?text=불안",
            "중립": "https://via.placeholder.com/150?text=중립"
        },
        "description": "테스트 캐릭터",
        "method": "text",
        "created_at": datetime.now().isoformat()
    }
    
    # static 폴더 확인/생성
    if not os.path.exists('static'):
        os.makedirs('static')
        print("📁 static 폴더 생성됨")
    
    # 로컬 백업 파일 생성
    characters_file = os.path.join('static', 'characters_backup.json')
    
    try:
        with open(characters_file, 'r', encoding='utf-8') as f:
            all_characters = json.load(f)
        print("📖 기존 백업 파일 로드됨")
    except (FileNotFoundError, json.JSONDecodeError):
        all_characters = {}
        print("📄 새 백업 파일 생성")
    
    all_characters[user_id] = test_character
    
    with open(characters_file, 'w', encoding='utf-8') as f:
        json.dump(all_characters, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 테스트 캐릭터 생성 완료!")
    print(f"📍 파일: {os.path.abspath(characters_file)}")
    print(f"👤 사용자 ID: {user_id}")
    print(f"🎭 캐릭터 감정 수: {len(test_character['images'])}")

# 실행
if __name__ == "__main__":
    create_test_character()