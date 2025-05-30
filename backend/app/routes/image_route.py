from flask import Blueprint, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

image_bp = Blueprint("image", __name__)

@image_bp.route("/generate_image", methods=["POST"])
def generate_image():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "프롬프트가 없습니다."}), 400

    try:
        response = client.images.generate(
            model="dall-e-3",  # dall-e-2도 가능
            prompt=prompt,
            size="1024x1024",
            n=1
        )
        image_url = response.data[0].url
        return jsonify({"url": image_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500