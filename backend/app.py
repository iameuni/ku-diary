# app.py - Flask 앱 메인 파일
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

# 환경 변수 로드
load_dotenv()

def create_app():
    """Flask 앱 팩토리"""
    app = Flask(__name__)
    
    # 🔑 CORS 설정 (프론트엔드와 통신 위해 필요)
    CORS(app, origins=[
        "http://localhost:3000",  # 개발용
        "https://your-frontend-domain.com"  # 프로덕션용 (실제 도메인으로 변경)
    ])
    
    # 🔑 기본 설정
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['DEBUG'] = os.environ.get('FLASK_ENV') == 'development'
    
    # 🔑 Firebase 초기화 확인
    try:
        from config.firebase_config import firebase_config
        if not firebase_config.is_initialized:
            print("⚠️ 경고: Firebase가 초기화되지 않았습니다!")
        else:
            print("✅ Firebase 초기화 확인됨")
    except Exception as e:
        print(f"❌ Firebase 설정 오류: {e}")
    
    # 🔑 Blueprint 등록
    try:
        from routes.character_route import character_bp
        from routes.diary_route import diary_bp
        
        app.register_blueprint(character_bp)
        app.register_blueprint(diary_bp)
        
        print("✅ Blueprint 등록 완료")
    except Exception as e:
        print(f"❌ Blueprint 등록 실패: {e}")
    
    # 🔑 기본 라우트들
    @app.route('/')
    def home():
        return jsonify({
            "message": "감정 웹툰 다이어리 API 서버",
            "status": "running",
            "firebase_initialized": firebase_config.is_initialized if 'firebase_config' in locals() else False
        })
    
    @app.route('/health')
    def health_check():
        """헬스 체크 엔드포인트"""
        try:
            # Firebase 연결 확인
            firebase_status = firebase_config.check_connection() if 'firebase_config' in locals() else False
            
            return jsonify({
                "status": "healthy",
                "firebase": "connected" if firebase_status else "disconnected",
                "timestamp": "2024-01-01T00:00:00Z"  # 실제로는 datetime.now()
            })
        except Exception as e:
            return jsonify({
                "status": "unhealthy",
                "error": str(e)
            }), 500
    
    @app.route('/api/test')
    def api_test():
        """API 테스트 엔드포인트"""
        return jsonify({
            "message": "API 연결 성공!",
            "available_endpoints": [
                "POST /api/generate_character - 캐릭터 생성",
                "POST /api/save-character - 캐릭터 저장", 
                "GET /api/get-character - 캐릭터 조회",
                "POST /api/diary/analyze_with_webtoon_image - 웹툰 생성"
            ]
        })
    
    # 🔑 에러 핸들러
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "엔드포인트를 찾을 수 없습니다",
            "available_endpoints": "/api/test에서 확인 가능"
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "서버 내부 오류가 발생했습니다",
            "details": str(error) if app.config['DEBUG'] else "자세한 정보는 로그를 확인하세요"
        }), 500
    
    # 🔑 요청 로깅
    @app.before_request
    def log_request():
        if request.path.startswith('/api/'):
            print(f"📞 API 요청: {request.method} {request.path}")
    
    return app

# 🔑 앱 인스턴스 생성
app = create_app()

# 🔑 개발 서버 실행 (run.py에서 호출)
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🚀 Flask 서버 시작:")
    print(f"   포트: {port}")
    print(f"   디버그: {debug}")
    print(f"   URL: http://localhost:{port}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)