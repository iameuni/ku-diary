from flask import Flask, send_from_directory
from flask_cors import CORS
import os

def create_app():
    # Flask 앱 생성 (static 폴더 절대 경로로 설정)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    static_folder = os.path.join(os.path.dirname(current_dir), 'static')
    
    app = Flask(__name__, 
                static_folder=static_folder,  # 절대 경로 사용
                static_url_path='/static')    # URL 경로 명시
    
    CORS(app)  # CORS 설정

    # 모든 라우트 등록
    from app.routes.character_route import character_bp
    from app.routes.gpt_route import gpt_bp
    from app.routes.image_route import image_bp
    from app.routes.diary_route import diary_bp
    from app.routes.summarizer_route import summarizer_bp

    app.register_blueprint(character_bp)
    app.register_blueprint(gpt_bp)
    app.register_blueprint(image_bp)
    app.register_blueprint(diary_bp)
    app.register_blueprint(summarizer_bp)
    
    # Static 폴더 생성 (없으면)
    WEBTOON_IMAGES_FOLDER = os.path.join(static_folder, 'webtoon_images')
    CHARACTER_IMAGES_FOLDER = os.path.join(static_folder, 'character_images')

    if not os.path.exists(static_folder):
        os.makedirs(static_folder)
        print(f"📁 Static 폴더 생성: {static_folder}")

    if not os.path.exists(WEBTOON_IMAGES_FOLDER):
        os.makedirs(WEBTOON_IMAGES_FOLDER)
        print(f"📁 웹툰 이미지 폴더 생성: {WEBTOON_IMAGES_FOLDER}")
        
    if not os.path.exists(CHARACTER_IMAGES_FOLDER):
        os.makedirs(CHARACTER_IMAGES_FOLDER)
        print(f"📁 캐릭터 이미지 폴더 생성: {CHARACTER_IMAGES_FOLDER}")

    # 중복된 static 라우트 제거하고 하나만 사용
    @app.route('/static/<path:filename>')
    def serve_static_files(filename):
        """모든 static 파일 서빙 (통합)"""
        try:
            print(f"🔍 Static 파일 요청: {filename}")
            print(f"📁 Static 폴더: {static_folder}")
            
            file_path = os.path.join(static_folder, filename)
            print(f"📍 찾는 파일: {file_path}")
            print(f"📄 파일 존재: {os.path.exists(file_path)}")
            
            if os.path.exists(file_path):
                return send_from_directory(static_folder, filename)
            else:
                print(f"❌ 파일 없음: {file_path}")
                return "File not found", 404
                
        except Exception as e:
            print(f"❌ Static 파일 서빙 오류: {e}")
            return f"Static file error: {str(e)}", 500

    print("✅ Flask 앱 생성 완료")
    print("🔥 Firebase + 로컬 이미지 저장 시스템 활성화")
    print("📋 요약 서비스 활성화")
    print(f"📁 Static 폴더 절대 경로: {static_folder}")
    print("📍 등록된 라우트:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule}")

    return app