from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import json
from PIL import Image
import os

app = Flask(__name__)
CORS(app)

# Ruta al modelo
ruta_modelo = os.path.join(os.path.dirname(__file__), "modelo_fashion.h5")
modelo = tf.keras.models.load_model(ruta_modelo)

# Detectar canales de entrada
input_shape = modelo.input_shape
expected_channels = input_shape[-1]

# Cargar nombres de clases
with open("class_names.json", "r", encoding="utf-8") as f:
    class_names = json.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No se subió archivo"}), 400

    file = request.files["image"]

    # Convertir según los canales del modelo
    if expected_channels == 1:
        img = Image.open(file.stream).convert("L").resize((28, 28))
    else:
        img = Image.open(file.stream).convert("RGB").resize((28, 28))

    # Preprocesar
    img = np.array(img) / 255.0
    img = img.reshape(1, 28, 28, expected_channels)

    pred = modelo.predict(img)[0]
    idx = int(np.argmax(pred))

    return jsonify({
        "predicted": class_names[idx],
        "top3": [
            {"class": class_names[i], "prob": float(pred[i])}
            for i in pred.argsort()[-3:][::-1]
        ]
    })

if __name__ == "__main__":
    app.run(debug=True)
