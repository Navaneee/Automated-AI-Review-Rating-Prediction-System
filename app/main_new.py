from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
import sqlite3
from datetime import datetime

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Download stopwords if not already available
nltk.download('stopwords')
stop_words = set(stopwords.words("english"))

app = FastAPI()

# ----------------------------------------------------
# Load Transformer model
# ----------------------------------------------------
model_dir = r"C:\Users\kjnav\Documents\Navaneee\B111-Navaneetha-K-J-Full-Stack-Automated-Review-Rating-System-\models\TR"

tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = AutoModelForSequenceClassification.from_pretrained(model_dir)
model.eval()

# ----------------------------------------------------
# Database Functions
# ----------------------------------------------------
def connect_to_db():
    conn = sqlite3.connect('sqlite3.db')
    cursor = conn.cursor()
    return conn, cursor

def initiate_db():
    conn, cursor = connect_to_db()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY,
            review TEXT,
            rating INTEGER,
            timestamp TEXT
        )
    ''')
    conn.commit()
    conn.close()

initiate_db()

# ----------------------------------------------------
# Text Cleaning Function
# ----------------------------------------------------
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

# ----------------------------------------------------
# API Input Schemas
# ----------------------------------------------------
class Review(BaseModel):
    review: str

class SavePrediction(BaseModel):
    review: str
    rating: int

# ----------------------------------------------------
# Prediction Endpoint (Transformer Model)
# ----------------------------------------------------
@app.post("/predict")
def predict_rating(request: Review):

    cleaned_text = light_clean(request.review)

    # Tokenize for Transformer
    inputs = tokenizer(
        cleaned_text,
        truncation=True,
        padding=True,
        max_length=256,
        return_tensors="pt"
    )

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class = torch.argmax(logits, dim=1).item()

    # If your model labels start at 0 → Convert to rating (1–5)
    rating = predicted_class + 1  

    return {"predicted_rating": int(rating)}

# ----------------------------------------------------
# Save Prediction Endpoint
# ----------------------------------------------------
@app.post("/save_prediction/")
def save_prediction(request: SavePrediction):

    current_time = datetime.utcnow().isoformat()
    conn, cursor = connect_to_db()
    cursor.execute('''
        INSERT INTO reviews (review, rating, timestamp)
        VALUES (?, ?, ?)
    ''', (request.review, request.rating, current_time))

    conn.commit()
    conn.close()

    return {
        "message": "Review saved successfully",
        "timestamp": current_time
    }

# ----------------------------------------------------
# History Endpoint
# ----------------------------------------------------
@app.get("/history/")
def get_history():
    conn, cursor = connect_to_db()
    cursor.execute("SELECT id, review, rating, timestamp FROM reviews")
    rows = cursor.fetchall()

    history = []
    for row in rows:
        history.append({
            "id": row[0],
            "review": row[1],
            "rating": row[2],
            "timestamp": row[3]
        })

    conn.close()
    return {"history": history}
