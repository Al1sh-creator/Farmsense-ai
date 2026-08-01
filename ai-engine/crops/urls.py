from django.urls import path
from .views import crop_recommendation

urlpatterns = [
    path("recommend/", crop_recommendation),
]