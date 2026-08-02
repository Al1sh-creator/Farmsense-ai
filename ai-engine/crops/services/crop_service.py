import os
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml_models",
    "artifacts",
    "crop_recommendation_model.pkl",
)

ENCODER_PATH = os.path.join(
    BASE_DIR,
    "ml_models",
    "artifacts",
    "crop_label_encoder.pkl",
)


class CropRecommendationService:

    def __init__(self):
        self.model = joblib.load(MODEL_PATH)
        self.encoder = joblib.load(ENCODER_PATH)

    def predict(self, data):

        features = [[
            data["N"],
            data["P"],
            data["K"],
            data["temperature"],
            data["humidity"],
            data["ph"],
            data["rainfall"],
        ]]

        prediction = self.model.predict(features)[0]

        crop = self.encoder.inverse_transform([prediction])[0]

        return crop


crop_service = CropRecommendationService()