from django.urls import path, include
from rest_framework import routers
from AppEvent import views
from AppEvent.views import MomoPaymentIPNView, payment_success_view


router = routers.DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='categories')
router.register('user', views.UserViewSet, basename='user')
router.register('event', views.EventViewSet, basename='event')
router.register('ticket', views.TicketViewSet, basename='ticket')
router.register('payment-ticket', views.PaymentTicketViewSet, basename='payment-ticket')
router.register('payment', views.PaymentViesSet, basename='payment')

urlpatterns = [
    path('api/', include(router.urls)),
    path('ticket/payment-ipn/', MomoPaymentIPNView.post, name='momo-ipn'),
    path('ticket/payment-success/', payment_success_view, name='payment-success'),
    path('checkin/<int:payment_ticket_id>/', views.checkin_api, name='checkin')
]