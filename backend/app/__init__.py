from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    # CORS 설정
    CORS(app)


    return app
