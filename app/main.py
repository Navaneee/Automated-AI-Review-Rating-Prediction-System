from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

# Load model and vectorizer using absolute paths
model_path = r"C:\Users\kjnav\Documents\Navaneee\Automated-AI-Review-Rating-Prediction-System\models\linear_svm_model.joblib"
vectorizer_path = r"C:\Users\kjnav\Documents\Navaneee\Automated-AI-Review-Rating-Prediction-System\models\tfidf_vectorizer.joblib"

model = joblib.load(model_path)
tfidf = joblib.load(vectorizer_path)

class Review(BaseModel):
    text: str

@app.post("/predict")
def predict_rating(review: Review):
    # Preprocess
    input_text = [review.text]

    # Convert to TF-IDF
    input_tfidf = tfidf.transform(input_text)

    # Predict rating
    prediction = model.predict(input_tfidf)[0]

    return {"predicted_rating": int(prediction)}
