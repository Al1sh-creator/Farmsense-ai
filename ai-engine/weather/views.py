from django.http import JsonResponse
from .services.open_meteo import get_weather

def weather_api(request):
    latitude = request.GET.get("latitude")
    longitude = request.GET.get("longitude")

    if not latitude or not longitude:
        return JsonResponse(
            {
                "success": False,
                "message": "Latitude and Longitude are required."
            },
            status=400,
        )

    result = get_weather(latitude, longitude)
    return JsonResponse(result)