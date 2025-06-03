from django.urls import re_path
from AppEvent import consumers

websocket_urlpatterns = [
    re_path(r'ws/notify/$', consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/test/$', consumers.TestConsumer.as_asgi()),

]