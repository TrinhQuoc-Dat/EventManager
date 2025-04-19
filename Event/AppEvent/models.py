from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth.models import BaseUserManager


class UserRole(models.TextChoices):
    ADMIN = 'admin'
    ORGANIZER = 'organizer'
    PARTICIPANT = 'participant'

    def __str__(self):
        return self.name


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError("Users must have a username")

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    avatar = CloudinaryField('avatar')
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.PARTICIPANT)
    objects = CustomUserManager()


    groups = models.ManyToManyField(
        'auth.Group',
        related_name='app_event_users',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='app_event_users_permissions',
        blank=True
    )


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True,
        ordering = ['-id']


class Category(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Event(BaseModel):
    title = models.CharField(max_length=100, null=False)
    description = models.TextField()
    date_time = models.DateTimeField()
    image = CloudinaryField(null=False)
    location = models.CharField(max_length=255, null=False)
    ticket_quantity = models.IntegerField(default=0)

    category = models.ForeignKey(Category, null=False, on_delete=models.RESTRICT)

    def __str__(self):
        return self.title


class Interaction(BaseModel):
    user = models.ForeignKey(User, null=False, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, null=False, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Like(Interaction):
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'event')


class Comment(Interaction):
    content = models.TextField(max_length=255, null=False)
    rate = models.SmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )


class StatusNotification(models.TextChoices):
    READ = 'read'
    NO_READ = 'no_read'

    def __str__(self):
        return self.name


class Notification(Interaction):
    content = RichTextField(null=False)
    status = models.CharField(
        max_length=10,
        choices=StatusNotification.choices,
        default=StatusNotification.NO_READ
    )


class StatusTicket(models.TextChoices):
    BOOKED = 'booked'
    CHECKIN = 'checkin'

    def __str__(self):
        return self.name


class TypeTicket(models.TextChoices):
    VIP = 'vip'
    NORMAL = 'normal'

    def __str__(self):
        return self.name


class Ticket(BaseModel):
    content = models.CharField(max_length=255, null=False)
    type_ticket = models.CharField(max_length=20, null=False, default=TypeTicket.NORMAL)
    event = models.ForeignKey(Event, null=False, on_delete=models.RESTRICT)


class TypePayment(models.TextChoices):
    MOMO = 'momo'
    VNPAY = 'vnpay'

    def __str__(self):
        return self.name


class StatusPayment(models.TextChoices):
    SUCCESS = 'success'
    FAIL = 'fail'

    def __str__(self):
        return self.name


class Payment(BaseModel):
    content = models.CharField(max_length=255, null=True)
    amount = models.BigIntegerField(null=False, default=0)
    payment_method = models.CharField(
        max_length=20,
        choices=TypePayment.choices,
        default=TypePayment.VNPAY)
    transaction_id = models.CharField(max_length=255, null=False)
    momo_order_id = models.CharField(max_length=255, null=False)
    status = models.CharField(
        max_length=20,
        choices=StatusPayment.choices,
        null=False
    )


class PaymentTicket(BaseModel):
    qr_code = models.CharField(max_length=255, null=False, unique=True)
    status = models.CharField(max_length=20, null=False, default=StatusTicket.BOOKED)
    user = models.ForeignKey(User, null=False, on_delete=models.RESTRICT)
    ticket = models.ForeignKey(Ticket, null=False, on_delete=models.RESTRICT)
    payment = models.ForeignKey(Payment, null=False, on_delete=models.RESTRICT)

    class Meta:
        unique_together = ('user', 'ticket', 'payment')


def create_data():
    # from AppEvent.models import *
    # from django.contrib.auth import get_user_model
    # from django.utils import timezone
    # import random

    # User = get_user_model()

    # Avatar mặc định
    default_avatar = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'

    # Danh sách dữ liệu giả
    users_data = [
        {
            'username': 'admin1',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'One',
            'email': 'admin1@example.com',
            'role': UserRole.ADMIN,
            'is_superuser': True,
            'is_staff': True,
        },
        {
            'username': 'organizer1',
            'password': 'org123',
            'first_name': 'Minh',
            'last_name': 'Pham',
            'email': 'minhp@example.com',
            'role': UserRole.ORGANIZER,
            'is_superuser': False,
            'is_staff': True,
        },
        {
            'username': 'organizer2',
            'password': 'org456',
            'first_name': 'Thị',
            'last_name': 'Lê',
            'email': 'leth@example.com',
            'role': UserRole.ORGANIZER,
            'is_superuser': False,
            'is_staff': True,
        },
        {
            'username': 'participant1',
            'password': 'part123',
            'first_name': 'An',
            'last_name': 'Nguyễn',
            'email': 'annguyen@example.com',
            'role': UserRole.PARTICIPANT,
            'is_superuser': False,
            'is_staff': False,
        },
        {
            'username': 'participant2',
            'password': 'part456',
            'first_name': 'Bình',
            'last_name': 'Trần',
            'email': 'binhtran@example.com',
            'role': UserRole.PARTICIPANT,
            'is_superuser': False,
            'is_staff': False,
        },
    ]

    # # Tạo user
    # for u in users_data:
    #     user = User.objects.create_user(
    #         username=u['username'],
    #         password=u['password'],
    #         email=u['email'],
    #         first_name=u['first_name'],
    #         last_name=u['last_name'],
    #         role=u['role'],
    #         avatar=default_avatar,
    #         is_superuser=u['is_superuser'],
    #         is_staff=u['is_staff'],
    #         is_active=True,
    #         date_joined=timezone.now()
    #     )


    cat_music = Category.objects.create(name='Âm nhạc')
    cat_tech = Category.objects.create(name='Công nghệ')
    cat_art = Category.objects.create(name='Nghệ thuật')

    events = [
        {
            'title': 'Đêm nhạc Acoustic Hà Nội',
            'description': 'Một buổi tối tràn ngập âm nhạc mộc mạc, sâu lắng cùng các nghệ sĩ indie nổi tiếng.',
            'location': 'Phố đi bộ Hồ Gươm, Hà Nội',
            'category': cat_music
        },
        {
            'title': 'Hội thảo AI Việt Nam 2025',
            'description': 'Cập nhật xu hướng trí tuệ nhân tạo, giao lưu chuyên gia và trình diễn công nghệ mới.',
            'location': 'Trung tâm Hội nghị Quốc gia',
            'category': cat_tech
        },
        {
            'title': 'Triển lãm Tranh hiện đại',
            'description': 'Trưng bày các tác phẩm hội họa hiện đại của các hoạ sĩ trẻ tài năng.',
            'location': 'Bảo tàng Mỹ thuật TP.HCM',
            'category': cat_art
        },
    ]

    event_objs = []
    for e in events:
        event = Event.objects.create(
            title=e['title'],
            description=e['description'],
            date_time=timezone.now() + timezone.timedelta(days=random.randint(3, 30)),
            image="https://res.cloudinary.com/demo/image/upload/sample.jpg",
            location=e['location'],
            ticket_quantity=100,
            category=e['category']
        )
        event_objs.append(event)

    for event in event_objs:
        Ticket.objects.create(
            content=f"Vé thường tham gia {event.title}",
            type_ticket=TypeTicket.NORMAL,
            event=event
        )
        Ticket.objects.create(
            content=f"Vé VIP tham gia {event.title}",
            type_ticket=TypeTicket.VIP,
            event=event
        )


# if __name__ == "__main__":
#     create_data()