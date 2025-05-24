from rest_framework.serializers import ModelSerializer, SerializerMethodField
from rest_framework import serializers
from .models import Category, User, Event, Ticket, Payment, PaymentTicket, TicketType, Comment


class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class ItemSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['image'] = instance.image.url if instance.image else ''
        return data
    
class OrganizerSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data
    
    class Meta:
        model = User
        fields = ['organization_name', 'avatar']

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

class UserFCMTokenSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['fcm_token']

class TicketTypeSerializer(ModelSerializer):
    # event_id = serializers.PrimaryKeyRelatedField(
    #     queryset=Event.objects.all(),
    #     required=True
    # )

    class Meta:
        model = TicketType
        fields = ['id', 'name', 'ticket_price', 'event', 'so_luong']
    
    # def create(self, validated_data):
    #     event_id = validated_data.pop('event_id')
    #     event = Event.objects.get(id=event_id)
    #     ticket_type = TicketType.objects.create(**validated_data, event=event)
    #     return ticket_type
    
class TicketSerializer(ModelSerializer):
    class Meta:
        model = Ticket
        fields = "__all__"

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
        data['organizer'] = OrganizerSerializer(instance.organizer).data
        data['ticket_types'] = TicketTypeSerializer(instance.ticket_types.all(), many=True).data
        data['comment_set'] = CommentSerializer(instance.comment_set.all(), many=True).data
        return data
    
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields  = ['organizer']
        # fields = ['id', 'title', 'description', 'start_date_time',
        #           'end_date_time', 'image', 'location', 'location_name',
        #           'kinh_do', 'vi_do', 'category_id', 
        #           'organizer', 'ticket_types']

class CommentUserSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar']

class CommentSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user'] = CommentUserSerializer(instance.user).data
        return data
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'rate', 'created_date', 'user', 'event']



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
