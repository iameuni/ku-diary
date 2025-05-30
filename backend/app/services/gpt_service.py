from app.gpt_generator import call_gpt_api

def generate_4cuts(text, emotion):
    return call_gpt_api(text, emotion)