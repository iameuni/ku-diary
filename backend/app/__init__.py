from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # CORS 설정
    
    # 모든 라우트 등록
    from app.routes.character_route import character_bp
    from app.routes.gpt_route import gpt_bp
    from app.routes.image_route import image_bp
    from app.routes.diary_route import diary_bp
    
    app.register_blueprint(character_bp)
    app.register_blueprint(gpt_bp)
    app.register_blueprint(image_bp)
    app.register_blueprint(diary_bp)
    
    print("✅ Flask 앱 생성 완료")
    print("📍 등록된 라우트:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule}")
    
    return app