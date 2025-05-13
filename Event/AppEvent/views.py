import hashlib
import hmac
from rest_framework import viewsets, generics, permissions, mixins, status, parsers
from django.contrib.auth import authenticate
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
from rest_framework.decorators import api_view, permission_classes
from google.oauth2 import id_token
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from google.auth.transport.requests import Request
import requests
from django.contrib.auth.decorators import login_required


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView):
    queryset = dao.get_categories()
    serializer_class = serializers.CategorySerializer
    # permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), perms.IsOrganizer()]
        return [permissions.AllowAny()]

    @action(methods=['get'], detail=True, url_path='events')
    def get_events(self, request, pk):
        events = self.get_object().event_set.filter(active=True)
        # pagination_class = paginations.EventSetPagination
        return Response(serializers.EventSerializer(events, many=True).data, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = dao.get_user()
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['get'], url_name='current_user', detail=False, permission_classes = [perms.UserPermission])
    def current_user(self, request):
        user = request.user
        if user.is_anonymous:
            return Response({'error': 'Token không hợp lệ hoặc đã hết hạn'}, status=401)

        return Response(serializers.UserSerializer(request.user).data)

    @action(methods=['post'], url_name='logout', detail=False, permission_classes = [perms.UserPermission])
    def logout(self, request):
        if request.auth:
            request.auth.delete()
        return Response({"detail": "Đăng xuất thành công"})

    @action(methods=['post'], url_path='login', detail=False, permission_classes=[], parser_classes=[parsers.JSONParser])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        expected_role = request.data.get('role')

        user = authenticate(username=username, password=password)
        print(user.role)
        if user is not None:
            if user.role != expected_role:
                return Response({'detail': 'Không đúng vai trò.'}, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": serializers.UserSerializer(user).data,
                'role': user.role
            })

        return Response({"error": "Sai tài khoản hoặc mật khẩu"}, status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=['post'], url_path='google-login', detail=False, permission_classes=[],
            parser_classes=[parsers.JSONParser])
    def google_login(self, request):
        token = request.data.get("id_token")
        access_token = request.data.get("access_token")
        if not token:
            return Response({'error': 'Thiếu id_token'}, status=status.HTTP_400_BAD_REQUEST)

        if not access_token:
            return Response({'error': 'Thiếu access_token'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            google_resp = id_token.verify_oauth2_token(token, Request())
        except ValueError:
            return Response({"error": "Token không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

        data = google_resp
        if data is None:
            return Response({"error": "Không có dữ liệu!!!"}, status=status.HTTP_400_BAD_REQUEST)

        email = data["email"]
        name = email.split('@')[0]
        picture = None

        # Gọi Google People API để lấy avatar
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        response = requests.get(
            "https://people.googleapis.com/v1/people/me?personFields=photos",
            headers=headers
        )
        if response.status_code == 200:
            people_data = response.json()
            if "photos" in people_data:
                picture = people_data["photos"][0].get("url")

        user, created = User.objects.get_or_create(username=email, defaults={
            "email": email,
            "first_name": name,
            "avatar": picture,
            "role": "participant"
        })

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": serializers.UserSerializer(user).data
        })


class EventViewSet(viewsets.ModelViewSet):
    queryset = dao.get_events()
    parser_classes = [parsers.MultiPartParser]
    # serializer_class = serializers.EventSerializer
    pagination_class = paginations.EventSetPagination
    # permission_classes = [perms.IsOrganizer]

    def get_queryset(self):
        query = self.queryset

        q = self.request.query_params.get('q')
        if q:
            query = query.filter(title__icontains=q)

        cate_id = self.request.query_params.get('category_id')
        if cate_id:
            query = query.filter(category_id=cate_id)

        return query

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'destroy']:
            return serializers.EventDetailSerializer
        return serializers.EventSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['create']:
            return [permissions.IsAuthenticated(), perms.IsOrganizer()]
        elif self.action in ['update', 'destroy', 'get_ticket_by_event']:
            return [permissions.IsAuthenticated(), perms.IsOrganizer()]  # Kiểm tra chi tiết trong get_object
        return [permissions.IsAuthenticated()]

    @action(methods=['get'], url_path="tickets", detail=True)
    def get_ticket_by_event(self, request, pk):
        tickets = dao.get_ticket_by_event(pk)
        return Response(serializers.TicketSerializer(tickets, many=True).data)


class TicketViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.CreateAPIView, generics.ListAPIView):
    queryset = dao.get_ticket()
    permission_classes = [perms.OwnerAuthenticated]
    pagination_class = paginations.EventSetPagination
    serializer_class = serializers.TicketSerializer


class TicketTypeViewSet(viewsets.ModelViewSet):
    queryset = TicketType.objects.filter(active=True)
    serializer_class = serializers.TicketTypeSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), perms.IsOrganizer()]
        return [permissions.AllowAny()]
    


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


def home(request):
    return render(request, 'home.html')


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


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token in valid'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        idinfo = id_token.verify_oauth2_token(token, Request())

        print(idinfo)

        email = idinfo['email']
        name = idinfo.get('name', '')
        picture_url = idinfo.get('picture')

        user, created = User.objects.get_or_create(username=email, avatar=picture_url, defaults={'email': email, 'first_name': name})

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'avatar': picture_url
        })
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=400)



