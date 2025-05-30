from PIL.ImagePalette import random
from rest_framework import viewsets, generics, permissions, mixins, status, parsers
from django.contrib.auth import authenticate
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, EventDate, Event, Comment, Ticket, User, PaymentTicket, Payment, StatusPayment,TypePayment, StatusTicket,StatusNotification, TicketType
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
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
import uuid
import cloudinary
from django.utils import timezone


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
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        avatar_file = self.request.FILES.get('avatar')
        if avatar_file:
            upload_result = cloudinary.uploader.upload(avatar_file)
            serializer.save(avatar=upload_result['secure_url'])  # lưu URL vào CloudinaryField
        else:
            serializer.save()

    @action(methods=['post'], url_path='fcm-token', detail=False)
    def save_fcm_token(self, request):
        user = request.user
        serializer = serializers.UserFCMTokenSerializer(user, data={'fcm_token': request.data.get('fcm_token')}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "FCM token saved"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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


class EventViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView, generics. UpdateAPIView, generics.DestroyAPIView):
    queryset = dao.get_events()
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    pagination_class = paginations.EventSetPagination

    

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
        if self.action in ['get_event_user']:
            return serializers.EventSerializer
        if self.action in ['get_ticket_by_event']:
            return serializers.TicketSerializer
        if self.action in ['get_comments']:
            return serializers.CommentSerializer
        if self.action in ['add_ticket_type']:
            return serializers.TicketTypeSerializer
        if self.action in ['add_event_date']:
            return serializers.EventDateSerializer
        if self.action in ['list']:
            return serializers.EventSerializer
        return serializers.EventDetailSerializer
    
    def get_permissions(self):
        if self.request.method.__eq__('GET'):
            return [permissions.AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy', 'get_ticket_by_event', 'add_event_date', 'add_ticket_type']:
            return [permissions.IsAuthenticated(), perms.IsOrganizer()]  
        elif self.action in ['get_comments'] and self.request.method.__eq__('POST'):
            return [permissions.IsAuthenticated(), perms.OwnerAuthenticated()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        location = self.request.data.get('location')
        if not location:
            return Response({"error": "Địa chỉ là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            geocoding_url = f"https://rsapi.goong.io/Geocode?address={location}&api_key={settings.GOONG_API_KEY}"
            response = requests.get(geocoding_url)
            geocoding_data = response.json()

            if geocoding_data['status'] != 'OK' or not geocoding_data.get('results'):
                return Response({"error": "Không tìm thấy địa chỉ"}, status=status.HTTP_400_BAD_REQUEST)

            coordinates = geocoding_data['results'][0]['geometry']['location']
            vi_do = coordinates['lat']
            kinh_do = coordinates['lng']

            with transaction.atomic():
                event = serializer.save(
                    organizer=self.request.user,
                    vi_do=vi_do,
                    kinh_do=kinh_do,
                    active=True
                )
                event_dates = self.request.data.get('event_dates', [])
                for date_data in event_dates:
                    EventDate.objects.create(
                        event=event,
                        event_date=date_data['event_date'],
                        start_time=date_data['start_time'],
                        end_time=date_data['end_time']
                    )
        except Exception as e:
            return Response({"error": f"Lỗi khi gọi Goong API: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_update(self, serializer):
        instance = serializer.instance
        location = self.request.data.get('location', instance.location)  # Lấy location mới hoặc giữ nguyên

        # Chỉ gọi Goong API nếu location thay đổi
        if 'location' in self.request.data and location != instance.location:
            if not location:
                return Response({"error": "Địa chỉ là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                geocoding_url = f"https://rsapi.goong.io/Geocode?address={location}&api_key={settings.GOONG_API_KEY}"
                response = requests.get(geocoding_url)
                response.raise_for_status()
                geocoding_data = response.json()

                if geocoding_data['status'] != 'OK' or not geocoding_data.get('results'):
                    return Response({"error": "Không tìm thấy địa chỉ"}, status=status.HTTP_400_BAD_REQUEST)

                coordinates = geocoding_data['results'][0]['geometry']['location']
                vi_do = coordinates['lat']
                kinh_do = coordinates['lng']

                with transaction.atomic():
                    serializer.save(
                        vi_do=vi_do,
                        kinh_do=kinh_do,
                        active=True
                    )
            except requests.RequestException as e:
                return Response({"error": f"Lỗi khi gọi Goong API: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                return Response({"error": f"Lỗi không xác định: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Nếu location không thay đổi, chỉ lưu các trường khác
            with transaction.atomic():
                serializer.save(active=True)

    @action(methods=['post'], detail=True, url_path='add-date')
    def add_event_date(self, request, pk):
        event = self.get_object()
        serializer = serializers.EventDateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(event=event)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=True, url_path='add-ticket-type')
    def add_ticket_type(self, request, pk):
        event = self.get_object()
        event_date_id = request.data.get('event_date_id')
        try:
            event_date = EventDate.objects.get(id=event_date_id, event=event)
        except EventDate.DoesNotExist:
            return Response({"error": "Ngày sự kiện không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializers.TicketTypeSerializer(data={
            'name': request.data.get('name'),
            'ticket_price': request.data.get('ticket_price'),
            'so_luong': request.data.get('so_luong'),
            'event_date': event_date.id
        })
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], url_path='user', detail=False)
    def get_event_user(self, request):
        user = request.user
        events = Event.objects.filter(organizer=user)
        page = self.paginate_queryset(events)
        if page is not None:
            serializer = serializers.EventSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = serializers.EventSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)

    @action(methods=['get'], url_path="tickets", detail=True)
    def get_ticket_by_event(self, request, pk):
        event_date_id = request.query_params.get('event_date_id')
        if event_date_id:
            tickets = TicketType.objects.filter(event_date_id=event_date_id, active=True)
        else:
            tickets = TicketType.objects.filter(event_date__event_id=pk, active=True)
        return Response(serializers.TicketTypeSerializer(tickets, many=True).data)

    @action(methods=['get', 'post'], detail=True, url_path='comments')
    def get_comments(self, request, pk):
        if request.method.__eq__('POST'):
            u = serializers.CommentSerializer(data={
                'content': request.data.get('content'),
                'rate': request.data.get('rate'),
                'user': request.user.pk,
                'event': pk
            })
            u.is_valid(raise_exception=True)
            c = u.save()
            return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)
        else:
            comments = self.get_object().comment_set.select_related('user').filter(active=True)
            return Response(serializers.CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)
        
    # @action(methods=['get', 'post'], detail=True, url_path='ticket-types')
    # def get_ticket_types(self, request, pk):
    #     if request.method.__eq__('POST'):
    #         u = serializers.TicketTypeSerializer(data={
    #             'name': request.data.get('name'),
    #             'ticket_price': request.data.get('ticket_price'),
    #             'so_luong': request.data.get('so_luong'),
    #             'event': pk
    #         })
    #         u.is_valid(raise_exception=True)
    #         c = u.save()
    #         return Response(serializers.TicketTypeSerializer(c).data, status=status.HTTP_201_CREATED)
    #     else:
    #         ticket_types = self.get_object().ticket_types.select_related('event').filter(active=True)
    #         return Response(serializers.TicketTypeSerializer(ticket_types, many=True).data, status=status.HTTP_200_OK)





class TicketViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.CreateAPIView, generics.ListAPIView):
    queryset = dao.get_ticket()
    permission_classes = [perms.OwnerAuthenticated]
    pagination_class = paginations.EventSetPagination
    serializer_class = serializers.TicketSerializer


class TicketTypeViewSet(viewsets.ViewSet, generics. DestroyAPIView, generics.UpdateAPIView):
    queryset = TicketType.objects.filter(active=True)
    serializer_class = serializers.TicketTypeSerializer
    permission_classes = [perms.IsOrganizer()]



class CommentViewSet(viewsets.ViewSet, generics. DestroyAPIView, generics.UpdateAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.OwnerAuthenticated()]

    
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

    @action(methods=['post'], url_path="payment", detail=False)
    def payment_view(self, request):
        user = request.user
        data = request.data
        ticket_id = data.get("ticket_id")

        try:
            ticket = TicketType.objects.get(id=ticket_id)
        except TicketType.DoesNotExist:
            return Response({"error": "Loại vé không tồn tại."}, status=status.HTTP_400_BAD_REQUEST)

        if ticket.so_luong <= 0:
            return Response({"error": "Vé đã hết."}, status=status.HTTP_400_BAD_REQUEST)

        amount = ticket.ticket_price

        # Giả định client đã thực hiện thanh toán xong, gửi về transId và orderId
        payment = Payment.objects.create(
            amount=amount,
            payment_method=data.get("payment_method", "momo"),
            transaction_id=data.get("transId", ""),
            momo_order_id=data.get("orderId", ""),
            status="success",
            content=f"Thanh toán vé {ticket.name}"
        )

        payment_ticket = PaymentTicket.objects.create(
            status="booked",
            user=user,
            ticket=ticket,
            payment=payment,
            qr_code=random()
        )

        payment_ticket.qr_code = str(uuid.uuid4())
        payment_ticket.save()

        # Trừ số lượng còn lại
        ticket.so_luong -= 1
        ticket.save()

        return Response(serializers.PaymentTicketSerializer(payment_ticket).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path="history", detail=True)
    def get_payment_ticket(self, request, pk):
        ticket = dao.get_payment_detail(user=request.user, pk=pk)
        if ticket:
            return Response(serializers.PaymentTicketFullSerializer(ticket).data)
        return Response({'error': 'Không tìm thấy giao dịch'}, status=404)

    @action(methods=['get'], url_path="qr-code", detail=False)
    def get_qr_code(self, request):
        payment_id = request.query_params.get("payment_id")
        ticket = dao.get_qr_code(user=request.user, payment_id=payment_id)
        if ticket:
            return Response(serializers.PaymentTicketQRCodeSerializer(ticket).data)
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


def home(request):
    return render(request, 'home.html')


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

                return Response({"message": "Payment recorded"}, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Payment failed or invalid"}, status=status.HTTP_400_BAD_REQUEST)


# kiểm tra checkin cần có domain
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkin_api(request, qr_code):
    try:
        ticket = PaymentTicket.objects.get(qr_code=qr_code)
        if ticket is None:
            return JsonResponse({'message': 'Không tìm thấy vé', 'status': 'checked_in'},
                                status=status.HTTP_400_BAD_REQUEST)

        if request.user.role != "organizer":
            return JsonResponse({'message': 'Không có quyền', 'status': 'checked_in'},
                                status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra ngày của vé
        event_date = ticket.ticket.event_date.event_date
        if event_date != timezone.now().date():
            return JsonResponse({'message': 'Vé không hợp lệ cho ngày hôm nay', 'status': 'invalid_date'},
                                status=status.HTTP_400_BAD_REQUEST)

        if ticket.status == StatusTicket.CHECKIN:
            return JsonResponse({'message': 'Đã check-in trước đó', 'status': 'checked_in'},
                                status=status.HTTP_200_OK)

        ticket.status = StatusTicket.CHECKIN
        ticket.save()

        data = {
            'message': 'Check-in thành công',
            'status': ticket.status,
            'user': ticket.user.username,
            'event': ticket.ticket.event_date.event.title,
            'ticket': ticket.ticket.name,
            'event_date': ticket.ticket.event_date.event_date
        }
        return JsonResponse(data, status=status.HTTP_201_CREATED)

    except PaymentTicket.DoesNotExist:
        return Response({'error': 'Không tìm thấy vé'}, status=status.HTTP_404_NOT_FOUND)

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



