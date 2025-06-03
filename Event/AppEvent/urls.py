from django.urls import path, include
from rest_framework import routers
from AppEvent import views
from AppEvent.views import MomoPaymentIPNView, payment_success_view
from .views import google_auth


router = routers.DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='categories')
router.register('user', views.UserViewSet, basename='user')
router.register('event', views.EventViewSet, basename='event')
router.register('ticket', views.TicketViewSet, basename='ticket')
router.register('payment-ticket', views.PaymentTicketViewSet, basename='payment-ticket')
router.register('payment', views.PaymentViesSet, basename='payment')
router.register('ticket-types', views.TicketTypeViewSet, basename='ticket-type')
router.register('comments', views.CommentViewSet, basename='comment')
router.register('event-date', views.EventDateViewSet, basename='event-date')
router.register('discount-codes', views.DiscountCodeViewSet, basename='discount-code')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/google/', google_auth),
    path('ticket/payment-ipn/', MomoPaymentIPNView.post, name='momo-ipn'),
    path('ticket/payment-success/', payment_success_view, name='payment-success'),
    path('checkin/<str:qr_code>/', views.checkin_api, name='checkin'),
    path('', views.home, name='home'),
]