from crops.services.crop_service import crop_service
from crops.services.fertilizer_service import fertilizer_service
from crops.services.irrigation_service import irrigation_service
from crops.services.yield_service import yield_service
from suggestions.rules.recommendation_rules import recommendation_rules
from weather.services.weather_service import weather_service

class SuggestionService:

    def generate(
        self,
        crop_data,
        fertilizer_data,
        irrigation_data,
        yield_data,
        latitude=None,
        longitude=None,
    ):

        crop = crop_service.predict(crop_data)

        fertilizer = fertilizer_service.predict(fertilizer_data)

        irrigation = irrigation_service.predict(irrigation_data)

        predicted_yield = yield_service.predict(yield_data)

        rules = recommendation_rules.generate(
            crop,
            fertilizer,
            irrigation,
            predicted_yield,
        )

        weather = None

        if latitude and longitude:
            weather = weather_service.get_weather(latitude, longitude)

        return {
            "recommended_crop": crop,
            "recommended_fertilizer": fertilizer,
            "irrigation_need": irrigation,
            "predicted_yield": predicted_yield,

            "weather": weather,

            "risk_level": rules["risk_level"],
            "recommendations": rules["recommendations"],
        }

suggestion_service = SuggestionService()