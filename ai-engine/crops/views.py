from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import CropRecommendationSerializer
from .services.crop_service import crop_service


@api_view(["POST"])
def crop_recommendation(request):

    serializer = CropRecommendationSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    prediction = crop_service.predict(serializer.validated_data)

    return Response({
        "recommended_crop": prediction
    })