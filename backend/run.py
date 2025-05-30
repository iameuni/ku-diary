import os
import sys

print("🔍 PYTHONPATH:", sys.path)

from app import create_app
from app.routes.summarizer_route import summarizer_bp
from app.routes.emotion_route import emotion_bp
from app.routes.gpt_route import gpt_bp
from app.routes.image_route import image_bp
from app.routes.character_route import character_bp  # photo_route 제거

app = create_app()

app.register_blueprint(summarizer_bp, url_prefix="/api")
app.register_blueprint(emotion_bp, url_prefix="/api")
app.register_blueprint(gpt_bp, url_prefix="/api")
app.register_blueprint(image_bp, url_prefix="/api")
# app.register_blueprint(photo_bp, url_prefix="/api")  # 이 줄 삭제
app.register_blueprint(character_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)