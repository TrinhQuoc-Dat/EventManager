from rest_framework.serializers import ModelSerializer, SerializerMethodField
from rest_framework import serializers
from .models import Category, User, Event, Ticket, Payment, PaymentTicket, TicketType, Comment, EventDate, DiscountCode


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
        fields = ['organization_name', 'avatar', 'email']
        read_only_fields = ['email']

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }
    def validate_avatar(self, value):
        if value and not str(value).startswith("http"):
            raise serializers.ValidationError("Avatar phải là đường dẫn URL hợp lệ của Cloudinary.")
        return value

    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #     data['avatar'] = instance.avatar.url if instance.avatar else ''
    #     return data

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
    class Meta:
        model = TicketType
        fields = ['id', 'name', 'ticket_price', 'event_date', 'so_luong']
    

    
class TicketSerializer(ModelSerializer):
    class Meta:
        model = Ticket
        fields = "__all__"

class EventDateSerializer(ModelSerializer):
    class Meta:
        model = EventDate
        fields = ['id', 'event_date', 'start_time', 'end_time']

class EventSerializer(ItemSerializer):
    price = SerializerMethodField()
    event_dates = EventDateSerializer(many=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'image', 'location', 'location_name', 'kinh_do', 'vi_do', 'price', 'category_id', 'event_dates']
        read_only_fields = ['kinh_do', 'vi_do']
    
    def get_price(self, obj):
        ticket_types = TicketType.objects.filter(event_date__event=obj, active=True)
        return min((tt.ticket_price for tt in ticket_types), default=0) if ticket_types.exists() else 0


class EventDetailSerializer(ItemSerializer):
    event_dates = EventDateSerializer(many=True, required=False)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['organizer'] = OrganizerSerializer(instance.organizer).data
        data['event_dates'] = EventDateSerializer(instance.event_dates.all(), many=True).data
        data['ticket_types'] = TicketTypeSerializer(
            TicketType.objects.filter(event_date__event=instance, active=True), many=True).data
        data['comment_set'] = CommentSerializer(instance.comment_set.all(), many=True).data
        return data
    
    def create(self, validated_data):
        event_dates_data = validated_data.pop('event_dates', [])
        event = Event.objects.create(**validated_data)
        for date_data in event_dates_data:
            EventDate.objects.create(event=event, **date_data)
        return event
    
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields  = ['organizer', 'kinh_do', 'vi_do']

    
class EventStatsSerializer(serializers.Serializer):
    event_title = serializers.CharField()
    total_tickets_sold = serializers.IntegerField()
    total_revenue = serializers.FloatField()
    ticket_types_stats = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    ) 
    

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
            'ticket', 'user', 'discount_code'
        ]


class PaymentTicketQRCodeSerializer(ModelSerializer):

    class Meta:
        model = PaymentTicket
        fields = ['id', 'created_date', 'qr_code' ]


class PaymentSerializer(ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"

class DiscountCodeSerializer(ModelSerializer):
    class Meta:
        model = DiscountCode
        fields = ['id', 'code', 'discount_percentage', 'ticket_type', 'max_usage', 'used_count', 'valid_from', 'valid_until']
        read_only_fields = ['used_count']

    def validate(self, data):
        if data['valid_from'] >= data['valid_until']:
            raise serializers.ValidationError("Ngày bắt đầu phải nhỏ hơn ngày kết thúc.")
        if data['discount_percentage'] <= 0 or data['discount_percentage'] > 100:
            raise serializers.ValidationError("Phần trăm giảm giá phải nằm trong khoảng 0-100.")
        return data
