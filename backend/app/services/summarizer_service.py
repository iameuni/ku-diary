from app.kobart_summarizer import summarize_text

def summarize_text_service(text: str) -> str:
    return summarize_text(text)