
import os
import firebase_admin
from firebase_admin import credentials, firestore

# 프로젝트 베이스 디렉토리 찾기
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
key_path = os.path.join(BASE_DIR, "backend", "firebase-key.json")

# Firebase 키 파일 경로 정규화
normalized_key_path = os.path.normpath(key_path)

# Firebase 초기화
try:
    cred = credentials.Certificate(normalized_key_path)
    firebase_admin.initialize_app(cred)
    print(f"✅ Firebase 초기화 완료: {normalized_key_path}")
except Exception as e:
    print(f"❌ Firebase 초기화 실패: {e}")
    print(f"   키 파일 경로: {normalized_key_path}")
    print(f"   키 파일 존재 여부: {os.path.exists(normalized_key_path)}")

# Firestore 클라이언트
db = firestore.client()