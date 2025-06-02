import os
import sys
from dotenv import load_dotenv

print("🔍 PYTHONPATH:", sys.path)

# 환경변수 로드
load_dotenv()

# Flask 앱 생성
from app import create_app

app = create_app()

# 추가 설정 (선택사항)
if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"🚀 서버 시작 - http://localhost:{port}")
    print(f"🔧 디버그 모드: {debug}")
    
    # API 키 확인
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key:
        print(f"✅ OpenAI API Key 로드됨: sk-...{api_key[-4:]}")
    else:
        print("⚠️ 경고: OPENAI_API_KEY가 설정되지 않았습니다!")
    
    app.run(host='0.0.0.0', port=port, debug=debug)