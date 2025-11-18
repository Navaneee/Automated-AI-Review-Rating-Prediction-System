# Automated-AI-Review-Rating-Prediction-System
An end-to-end AI-driven rating prediction system that automatically predicts 1–5 star ratings from customer review text across e-commerce products.
This project combines Machine Learning, Deep Learning, and Transformer-based NLP models to achieve multi-class review rating prediction accuracy ≥ 70%.

 ## Key Features

Large-scale Amazon review dataset (500K+ reviews) preprocessed and cleaned.

Supports 5-class classification (ratings 1–5).

Baseline ML Models: Logistic Regression, Naive Bayes, Random Forest, XGBoost, SVM.

Deep Learning Models: CNN, LSTM, BiLSTM, GRU.

Transformer Models: BERT, RoBERTa, DistilBERT, ALBERT, XLNet, ELECTRA.

Implements tokenization, stemming, lemmatization, and TF-IDF / Word2Vec / GloVe embeddings.

SMOTE / class weighting for imbalance correction.

Hyperparameter tuning with GridSearchCV & RandomizedSearchCV.

Comprehensive Model Evaluation Dashboard (Accuracy, F1-Score, Confusion Matrix).

Fully documented data preprocessing → EDA → model development → evaluation → reporting pipeline.

## Objective

To develop a scalable and explainable AI system capable of predicting user satisfaction levels directly from textual reviews, enabling smarter insights for e-commerce businesses and automated sentiment-driven analytics.

## Tech Stack

Python, Pandas, NumPy, Scikit-learn, TensorFlow/Keras, HuggingFace Transformers, Matplotlib/Seaborn

Jupyter Notebooks / Google Colab for experimentation

Git & GitHub for version control and project documentation

## Target Performance

Achieve ≥ 70% multi-class accuracy (1–5 rating prediction) through optimized transformer-based fine-tuning on domain-specific Amazon review data.

## Setup

1. Clone the repository
```bash
git clone https://github.com/Navaneee/Automated-AI-Review-Rating-Prediction-System.git review_prediction
cd review_prediction
```
2. Create and activate a virtual environment
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  
```
3. Install requirements
```bash
pip install -r requirements.txt
```
4. Run FastAPI
```bash
cd app
uvicorn main:app
```
5. Example
Request
```bash
curl --location 'http://127.0.0.1:8000/predict' \
--header 'Content-Type: application/json' \
--data '{"review":"This product is good"}'
```  
Response 
```bash
{
    "predicted_rating": 3
}
```  
