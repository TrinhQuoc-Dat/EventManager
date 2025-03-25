from django.urls import path, include
from rest_framework import routers


router = routers.DefaultRouter()
# router.register('categorys', views.CategoryViewSet, basename='categorys')

urlpatterns = [
    path('', include(router.urls))
]