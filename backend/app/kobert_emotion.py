from transformers import BertTokenizer, BertForSequenceClassification
import torch

try:
    model = BertForSequenceClassification.from_pretrained("monologg/kobert", num_labels=5)
    tokenizer = BertTokenizer.from_pretrained("monologg/kobert")
except Exception as e:
    print(f"❌ 모델 로딩 실패: {e}")
    model = None
    tokenizer = None

label_map = {0: "기쁨", 1: "슬픔", 2: "분노", 3: "불안", 4: "중립"}

def predict_with_kobert(text):
    if model is None or tokenizer is None:
        return "오류", 0.0
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.nn.functional.softmax(logits, dim=1)
        pred = torch.argmax(probs, dim=1).item()
        return label_map[pred], round(probs[0][pred].item(), 4)
