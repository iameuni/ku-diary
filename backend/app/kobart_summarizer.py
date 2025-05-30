from transformers import PreTrainedTokenizerFast, BartForConditionalGeneration

# 모델 로드 시 명시적으로 캐시 디렉토리 지정
tokenizer = PreTrainedTokenizerFast.from_pretrained(
    "digit82/kobart-summarization",
    cache_dir="./model_cache"
)
model = BartForConditionalGeneration.from_pretrained(
    "digit82/kobart-summarization", 
    cache_dir="./model_cache"
)

def summarize_text(text: str) -> str:
    # 디버깅을 위한 로그 추가
    print(f"Input text: {text}")
    
    # 더 짧은 길이로 제한
    input_ids = tokenizer.encode(
        text, 
        return_tensors="pt", 
        max_length=256,  # 512 -> 256
        truncation=True,
        padding=True
    )
    
    summary_ids = model.generate(
        input_ids,
        max_length=50,  # 80 -> 50
        min_length=10,  # 20 -> 10
        num_beams=2,    # 4 -> 2
        length_penalty=1.0,
        no_repeat_ngram_size=2,  # 3 -> 2
        early_stopping=True
    )
    
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    print(f"Output summary: {summary}")
    
    return summary