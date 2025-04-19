from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import Category, User, Event, Ticket, Payment, PaymentTicket
from rest_framework import serializers


class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'password', 'email', 'avatar']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        data = validated_data.copy()

        user = User(**data)
        user.set_password(data['password'])
        user.save()

        return user


class EventSerializer(ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


class TicketSerializer(ModelSerializer):

    class Meta:
        model = Ticket
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

