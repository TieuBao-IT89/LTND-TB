from flask import Flask, jsonify, render_template, request
import io
import os
import pickle
import sys

from underthesea import word_tokenize


def tokenize_vn(text):
    return word_tokenize(text)


sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

_BASE = os.path.dirname(os.path.abspath(__file__))
app = Flask(
    __name__,
    template_folder=os.path.join(_BASE, "templates"),
    static_folder=os.path.join(_BASE, "static"),
)

_p = lambda name: os.path.join(_BASE, name)
try:
    with open(_p("model.pkl"), "rb") as f:
        model = pickle.load(f)
    with open(_p("vectorizer.pkl"), "rb") as f:
        vectorizer = pickle.load(f)
    print("Đã tải model thành công.")
except Exception as e:
    print(f"Lỗi tải model: {e}")
    model = vectorizer = None


def _read_categories_from_csv():
    path = _p("Dataset_articles.csv")
    if not os.path.isfile(path):
        return None
    seen = set()
    try:
        import pandas as pd

        for chunk in pd.read_csv(
            path,
            encoding="utf-8",
            usecols=["Category"],
            chunksize=120_000,
            low_memory=False,
        ):
            seen.update(chunk["Category"].dropna().astype(str).unique())
    except Exception as ex:
        print(f"Không đọc được Category từ CSV: {ex}")
        return None
    return sorted(seen)


def get_class_labels():
    if model is not None and hasattr(model, "classes_"):
        return [str(c) for c in model.classes_]
    cats = _read_categories_from_csv()
    return list(cats) if cats else []


_PRETTY = {
    "b": "Business (Kinh doanh)",
    "t": "Science & Technology (Khoa học & Công nghệ)",
    "e": "Entertainment (Giải trí)",
    "m": "Health (Sức khỏe)",
}


def category_display(label):
    return _PRETTY.get(str(label), str(label))


def _short_from_display(full):
    if "(" in full and ")" in full:
        return full.split("(", 1)[1].rstrip(")").strip()
    return full


_CHIP_LABEL = {"b": "Kinh doanh", "t": "Công nghệ", "e": "Văn hóa - Giải trí", "m": "Sức khỏe"}

_CHIP_HIDE_SHORT = frozenset(
    {
        "Diễn đàn",
        "Công nghệ",
        "Lao Động & Đời sống",
        "Lao Động cuối tuần",
        "Lưu trữ",
        "Media",
        "Người Việt tử tế",
        "Phóng sự",
        "Quỹ TLV",
        "Sổ tay kinh tế",
        "Sự kiện Bình luận",
        "Thông tin doanh nghiệp",
        "Thông tin tiện ích",
        "Thế giới",
        "Tin bài liên quan",
        "Tin bài xem thêm",
        "Tin hoạt động",
        "Tin địa phương",
        "Tin tức việc làm",
    }
)


def _topic_row(key):
    full = category_display(key)
    short = _CHIP_LABEL.get(str(key), _short_from_display(full))
    return {"key": key, "short": short, "full": full}


@app.route("/")
def home():
    topics_all = [_topic_row(k) for k in get_class_labels()]
    topics_chips = [t for t in topics_all if t["short"] not in _CHIP_HIDE_SHORT]
    return render_template("index.html", topics_all=topics_all, topics_chips=topics_chips)


@app.route("/predict", methods=["POST"])
def predict():
    if not model or not vectorizer:
        return jsonify({"error": "Mô hình chưa được tải, vui lòng kiểm tra lại file model.pkl"}), 500

    data = request.get_json() or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "Vui lòng nhập nội dung tin tức."}), 400

    try:
        vec = vectorizer.transform([text])
        raw = model.predict(vec)[0]
        label_s = str(raw.item() if hasattr(raw, "item") else raw)
        out = {"label": label_s, "category": category_display(label_s)}
        if hasattr(model, "predict_proba"):
            out["confidence"] = float(max(model.predict_proba(vec)[0]))
        return jsonify(out)
    except Exception as e:
        return jsonify({"error": f"Đã xảy ra lỗi: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
