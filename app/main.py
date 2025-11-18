from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords

# Download stopwords if not already available
nltk.download('stopwords')

stop_words = set(stopwords.words("english"))

app = FastAPI()

# Load model and vectorizer using absolute paths
model_path = r"C:\Users\kjnav\Documents\Navaneee\Automated-AI-Review-Rating-Prediction-System\models\linear_svm_model.joblib"
vectorizer_path = r"C:\Users\kjnav\Documents\Navaneee\Automated-AI-Review-Rating-Prediction-System\models\tfidf_vectorizer.joblib"

model = joblib.load(model_path)
tfidf = joblib.load(vectorizer_path)


# -------------------------------------------
#  Text Cleaning Function
# -------------------------------------------
def light_clean(text):

    # If NaN, return empty string
    if pd.isna(text):
        return ""

    # Lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\S+", "", text)

    # Keep only letters
    text = re.sub(r"[^a-z\s]", " ", text)

    # Fix extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    # Tokenize words
    words = text.split()

    # Remove stopwords & very short words
    words = [w for w in words if w not in stop_words and len(w) > 2]

    return " ".join(words)


# -------------------------------------------
#   API Input Schema
# -------------------------------------------
class Review(BaseModel):
    review: str


# -------------------------------------------
#   Prediction Endpoint
# -------------------------------------------
@app.post("/predict")
def predict_rating(request: Review):

    # Clean the text before TF-IDF
    cleaned_text = light_clean(request.review)

    # TF-IDF transform (expects a list)
    input_tfidf = tfidf.transform([cleaned_text])

    # Predict rating
    prediction = model.predict(input_tfidf)[0]

    return {"predicted_rating": int(prediction)}
