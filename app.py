from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import io, os, gdown

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "https://know-your-tumor.netlify.app"}}) # Replace with your Netlify domain

# Configuration
MODEL_PATH = "emotion_model.h5"
DRIVE_URL = "https://drive.google.com/uc?export=download&id=1FpCdgR2FyR0ZA28Hdnugx6j5lX8natZq"
IMG_SIZE = 100  # Matches training size

# Force TensorFlow to use CPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# Auto-download model if missing
if not os.path.exists(MODEL_PATH):
    print("Model not found. Downloading from Drive...")
    gdown.download(DRIVE_URL, MODEL_PATH, quiet=False)

# Load model once at startup
model = load_model(MODEL_PATH)

# Optional: Compile the model to avoid warnings
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

@app.route("/", methods=["GET"])
def home():
    return "Brain Tumor Detection API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    f = request.files["file"]
    if f.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        data = f.read()
        img = Image.open(io.BytesIO(data)).convert("RGB")
        img = img.resize((IMG_SIZE, IMG_SIZE))
        arr = np.array(img) / 255.0
        arr = np.expand_dims(arr, axis=0)  # (1, IMG_SIZE, IMG_SIZE, 3)

        pred = model.predict(arr)[0]
        label = "Tumor" if np.argmax(pred) == 0 else "No Tumor"
        return jsonify({"prediction": label})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)