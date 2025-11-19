from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import re
import nltk
from nltk.corpus import stopwords
import pandas as pd

# Download stopwords if needed
nltk.download("stopwords")
stop_words = set(stopwords.words("english"))

app = FastAPI()

# Load Transformer model & tokenizer
model_dir = r"C:\Users\kjnav\Documents\Navaneee\B111-Navaneetha-K-J-Full-Stack-Automated-Review-Rating-System-\models\TR"
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = AutoModelForSequenceClassification.from_pretrained(model_dir)
model.eval()

# Your cleaning function
def light_clean(text):
    if pd.isna(text):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    words = text.split()
    words = [w for w in words if w not in stop_words and len(w) > 2]
    return " ".join(words)

class Review(BaseModel):
    review: str

@app.post("/predict")
def predict_rating(request: Review):
    # First clean the text
    cleaned = light_clean(request.review)

    # Then tokenize
    inputs = tokenizer(
        cleaned,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=256,
    )

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    predicted_class = torch.argmax(logits, dim=1).item()
    rating = int(predicted_class)+1  # or +1 depending on how you mapped labels
    return {"predicted_rating": rating}
