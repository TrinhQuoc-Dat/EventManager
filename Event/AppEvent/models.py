from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth.models import BaseUserManager
import uuid


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
    organization_name = models.CharField(max_length=255, null=True, blank=True)
    fcm_token = models.CharField(max_length=255, blank=True, null=True)
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
    # start_date_time = models.DateTimeField()
    # end_date_time = models.DateTimeField()
    image = CloudinaryField(null=False)
    location = models.CharField(max_length=255, null=False)
    location_name = models.CharField(max_length=255, null=False)
    kinh_do = models.FloatField(null=True, blank=True)
    vi_do = models.FloatField(null=True, blank=True)

    category = models.ForeignKey(Category, null=False, on_delete=models.RESTRICT)
    organizer = models.ForeignKey(User, null=False, on_delete=models.CASCADE, related_name='events')

    def __str__(self):
        return self.title

class EventDate(BaseModel):
    event = models.ForeignKey(Event, null=False, on_delete=models.CASCADE, related_name='event_dates')
    event_date = models.DateField(null=False)  # Ngày cụ thể của sự kiện
    start_time = models.TimeField(null=False)  # Giờ bắt đầu trong ngày
    end_time = models.TimeField(null=False)    # Giờ kết thúc trong ngày

    class Meta:
        unique_together = ('event', 'event_date')  # Đảm bảo mỗi ngày chỉ có một bản ghi cho sự kiện
        ordering = ['event_date']

    def __str__(self):
        return f"{self.event.title} - {self.event_date}"


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


class TicketType(BaseModel):
    name = models.CharField(max_length=50, null=False)
    ticket_price = models.DecimalField(default=0, null=False, max_digits=10, decimal_places=2)
    so_luong = models.IntegerField(null=False, default=0)
    event_date = models.ForeignKey(EventDate, null=False, on_delete=models.RESTRICT, related_name='ticket_types')

    def __str__(self):
        return f"{self.name} ({self.event_date})"

class Ticket(BaseModel):
    content = models.CharField(max_length=255, null=False)
    ticket_type = models.ForeignKey(TicketType, null=False, on_delete=models.RESTRICT)

    def __str__(self):
        return self.content


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
    transaction_id = models.CharField(max_length=255, null=True)
    momo_order_id = models.CharField(max_length=255, null=True)
    status = models.CharField(
        max_length=20,
        choices=StatusPayment.choices,
        null=False
    )


class PaymentTicket(BaseModel):
    qr_code = models.CharField(max_length=64, unique=True, default=uuid.uuid4)
    status = models.CharField(max_length=20, null=False, default=StatusTicket.BOOKED)
    user = models.ForeignKey(User, null=False, on_delete=models.RESTRICT)
    ticket = models.ForeignKey(TicketType, null=False, on_delete=models.RESTRICT)
    payment = models.ForeignKey(Payment, null=False, on_delete=models.RESTRICT)
    discount_code = models.ForeignKey('DiscountCode', null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        unique_together = ('user', 'ticket', 'payment')

class DiscountCode(BaseModel):
    code = models.CharField(max_length=20, unique=True)
    discount_percentage = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Phần trăm giảm giá (0-100)"
    )
    ticket_type = models.ForeignKey(TicketType, null=False, on_delete=models.CASCADE)
    max_usage = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    used_count = models.IntegerField(default=0)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField()

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}% off)"

    def is_valid(self):
        now = timezone.now()
        return (
            self.active and
            self.valid_from <= now <= self.valid_until and
            (self.max_usage == 0 or self.used_count < self.max_usage)
        )
