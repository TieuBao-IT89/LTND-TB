"""Huấn luyện TF-IDF + Logistic Regression, lưu model.pkl và vectorizer.pkl."""
import io
import pickle
import sys

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from underthesea import word_tokenize

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")


def tokenize_vn(text):
    return word_tokenize(text)

# Đọc file CSV, giữ lại các dòng có cả Title và Category
df = pd.read_csv("Dataset_articles.csv", encoding="utf-8").dropna(subset=["Title", "Category"])

# Giới dữ liệu 50.000 dòng
if len(df) > 50_000:
    df = df.sample(50_000, random_state=42)

# Tách dữ liệu thành tập huấn luyện và kiểm tra
X_train, X_test, y_train, y_test = train_test_split(
    df["Title"], df["Category"], test_size=0.2, random_state=42
)

# Tạo bộ chuyển đổi TF-IDF
vectorizer = TfidfVectorizer(tokenizer=tokenize_vn, max_features=20000)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Tạo mô hình Logistic Regression
model = LogisticRegression(max_iter=200)

# Huấn luyện mô hình
model.fit(X_train_vec, y_train)

# Dự đoán trên tập kiểm tra và đánh giá
y_pred = model.predict(X_test_vec)

print("Độ chính xác:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

with open("model.pkl", "wb") as f:
    pickle.dump(model, f)
with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)
print("Đã lưu model.pkl, vectorizer.pkl")
