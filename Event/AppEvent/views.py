import hashlib
import hmac
from rest_framework import viewsets, generics, permissions, mixins, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Event, Comment, Ticket, User, PaymentTicket, Payment, StatusPayment,TypePayment, StatusTicket,StatusNotification, TicketType
from AppEvent import dao, serializers, paginations, perms
from django.shortcuts import redirect
from AppEvent.payment import create_momo_payment
from django.http import JsonResponse
from rest_framework.views import APIView
import json
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import base64
import qrcode
from io import BytesIO
from django.conf import settings


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView):
    queryset = dao.get_categories()
    serializer_class = serializers.CategorySerializer
    permission_classes = [permissions.AllowAny]


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveAPIView):
    queryset = dao.get_user()
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['get'], url_name='current_user', detail=False, permission_classes = [perms.UserPermission])
    def current_user(self, request):
        return Response(serializers.UserSerializer(request.user).data)

    @action(methods=['post'], url_name='logout', detail=False, permission_classes = [perms.UserPermission])
    def logout(self, request):
        if request.auth:
            request.auth.delete()
        return Response({"detail": "Đăng xuất thành công"})


class EventViewSet(viewsets.ModelViewSet):
    queryset = dao.get_events()
    parser_classes = [parsers.MultiPartParser]
    serializer_class = serializers.EventSerializer
    pagination_class = paginations.EventSetPagination
    permission_classes = [perms.IsOrganizer]

    @action(methods=['get'], url_path="tickets", detail=True)
    def get_ticket_by_event(self, request, pk):
        tickets = dao.get_ticket_by_event(pk)
        return Response(serializers.TicketSerializer(tickets, many=True).data)


class TicketViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.CreateAPIView, generics.ListAPIView):
    queryset = dao.get_ticket()
    permission_classes = [perms.OwnerAuthenticated]
    pagination_class = paginations.EventSetPagination
    serializer_class = serializers.TicketSerializer

class TicketTypeViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = TicketType.objects.filter(active=True)
    serializer_class = serializers.TicketTypeSerializer

class PaymentTicketViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = dao.get_payment_ticket()
    permission_classes = [perms.OwnerAuthenticated]
    serializer_class = serializers.PaymentTicketSerializer
    pagination_class = paginations.PaymentTicketSetPagination

    @action(methods=['post'], url_path="payment/momo", detail=False)
    def momo_payment_view(self, request):
        order_info = "Thanh toán sự kiện"
        redirect_url = settings.DOMAIN + "/ticket/payment-success/"
        ipn_url = settings.DOMAIN + "/ticket/payment-ipn/"

        result = create_momo_payment(amount=request.data['amount'],
                                     user_id=request.user.id,
                                     ticket_id=request.data['ticket_id'],
                                     order_info=order_info,
                                     redirect_url=redirect_url,
                                     ipn_url=ipn_url)
        return redirect(result['payUrl'])

    @action(methods=['get'], url_path="history", detail=True)
    def get_payment_ticket(self, request, pk):
        ticket = dao.get_payment_detail(user=request.user, pk=pk)
        if ticket:
            return Response(serializers.PaymentTicketFullSerializer(ticket).data)
        return Response({'error': 'Không tìm thấy giao dịch'}, status=404)


class PaymentViesSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = dao.get_payments()
    serializer_class = serializers.PaymentSerializer
    permission_classes = [perms.OwnerAuthenticated]
    pagination_class = paginations.PaymentTicketSetPagination

    @action(methods=['get'], url_path='history', detail=False)
    def get_payment_by_user(self, request):
        payment = dao.get_payment_by_user(request.user)
        return Response(serializers.PaymentSerializer(payment, many=True).data)


def payment_success_view(request):
    return render(request, "payment_success.html")


def generate_qr_url(payment_ticket):
    return f"{settings.DOMAIN}/ticket/checkin/{payment_ticket.id}/"


def generate_qr_code(data: str) -> str:
    qr = qrcode.make(data)
    buffer = BytesIO()
    qr.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


class MomoPaymentIPNView(APIView):
    def post(self, request):
        data = request.data
        print(data)
        print(data.get("resultCode"))
        print("abc")

        if data.get("resultCode") == 0:
            try:
                extra_data = json.loads(data.get("extraData", "{}"))
                user_id = extra_data.get("user")
                ticket_id = extra_data.get("ticket")
                amount = int(data.get("amount", 0))

                user = User.objects.get(id=user_id)
                ticket = Ticket.objects.get(id=ticket_id)

                payment = Payment.objects.create(
                    amount=amount,
                    payment_method="momo",
                    transaction_id=data.get("transId"),
                    momo_order_id=data.get("orderId"),
                    status="success",
                    content="Thanh toán " + ticket.content
                )

                # Tạo PaymentTicket
                payment_ticket = PaymentTicket.objects.create(
                    status="booked",
                    user=user,
                    ticket=ticket,
                    payment=payment
                )
                payment_ticket.qr_code = generate_qr_code(generate_qr_url(payment_ticket.id))
                payment_ticket.save()

                return Response({"message": "Payment recorded"}, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Payment failed or invalid"}, status=status.HTTP_400_BAD_REQUEST)


# kiểm tra checkin cần có domain
@csrf_exempt
def checkin_api(request, payment_ticket_id):
    try:
        ticket = PaymentTicket.objects.select_related('ticket', 'user', 'ticket__event').get(pk=payment_ticket_id)

        if ticket.status == StatusTicket.CHECKIN:
            return JsonResponse({'message': 'Đã check-in trước đó', 'status': 'checked_in'}, status=200)

        ticket.status = StatusTicket.CHECKIN
        ticket.save()

        data = {
            'message': 'Check-in thành công',
            'status': ticket.status,
            'user': ticket.user.username,
            'event': ticket.ticket.event.title,
            'ticket_type': ticket.ticket.type_ticket,
        }
        return JsonResponse(data, status=200)

    except PaymentTicket.DoesNotExist:
        return JsonResponse({'error': 'Không tìm thấy vé'}, status=404)






