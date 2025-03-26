from django.urls import path, include
from rest_framework import routers
from AppEvent import views


router = routers.DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='categories')
router.register('user', views.UserViewSet, basename='user')
router.register('event', views.EventViewSet, basename='event')

urlpatterns = [
    path('api/', include(router.urls))
]