import requests

BASE_URL = "https://api.open-meteo.com/v1/forecast"


def get_weather(latitude, longitude):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "wind_speed_10m"
        ]
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        return {
            "success": True,
            "data": data.get("current", {})
        }

    except requests.RequestException as e:
        return {
            "success": False,
            "message": str(e)
        }