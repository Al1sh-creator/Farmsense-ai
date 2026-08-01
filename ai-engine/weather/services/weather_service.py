import requests


class WeatherService:

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    def get_weather(self, latitude, longitude):

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m",
            "daily": "precipitation_sum",
            "timezone": "auto",
        }

        response = requests.get(self.BASE_URL, params=params)

        response.raise_for_status()

        data = response.json()

        return {
            "temperature": data["current"]["temperature_2m"],
            "humidity": data["current"]["relative_humidity_2m"],
            "wind_speed": data["current"]["wind_speed_10m"],
            "rainfall": data["daily"]["precipitation_sum"][0],
        }


weather_service = WeatherService()