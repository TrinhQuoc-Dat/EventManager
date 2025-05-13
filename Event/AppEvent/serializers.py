from rest_framework.serializers import ModelSerializer, SerializerMethodField
from rest_framework import serializers
from .models import Category, User, Event, Ticket, Payment, PaymentTicket, TicketType


class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class ItemSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['image'] = instance.image.url if instance.image else ''
        return data

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    def create(self, validated_data):
        data = validated_data.copy()

        user = User(**data)
        user.set_password(data['password'])
        user.save()

        return user


class EventSerializer(ItemSerializer):
    price = SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'image', 'start_date_time', 'location', 'location_name', 'price', 'category_id']
    
    def get_price(self, obj):
        # Giả sử lấy giá thấp nhất từ TicketType liên quan
        ticket_types = obj.ticket_types.filter(active=True)
        return min((tt.ticket_price for tt in ticket_types), default=0) if ticket_types.exists() else 0

class EventDetailSerializer(ItemSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['organizer'] = UserSerializer(instance.organizer).data
        return data
    
    class Meta:
        model = Event
        fields = '__all__'


class TicketSerializer(ModelSerializer):
    class Meta:
        model = Ticket
        fields = "__all__"


class TicketTypeSerializer(ModelSerializer):
    class Meta:
        model = TicketType
        fields = "__all__"


class PaymentTicketFullSerializer(ModelSerializer):
    ticket = serializers.SerializerMethodField()
    payment = serializers.SerializerMethodField()

    class Meta:
        model = PaymentTicket
        fields = ['id', 'status', 'qr_code', 'ticket', 'payment', 'created_date']

    def get_ticket(self, obj):
        return {
            'id': obj.ticket.id,
            'type_ticket': obj.ticket.type_ticket,
            'price': obj.ticket.price,
            'content': obj.ticket.content,
            'event': obj.ticket.event.title
        }

    def get_payment(self, obj):
        return {
            'id': obj.payment.id,
            'amount': obj.payment.amount,
            'method': obj.payment.payment_method,
            'status': obj.payment.status,
            'transaction_id': obj.payment.transaction_id
        }


class PaymentTicketSerializer(ModelSerializer):

    class Meta:
        model = PaymentTicket
        fields = [
            'id', 'created_date', 'qr_code', 'status', 'payment',
            'ticket', 'user'
        ]


class PaymentSerializer(ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
