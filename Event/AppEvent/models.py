from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from django.core.validators import MinValueValidator, MaxValueValidator


class UserRole(models.TextChoices):
    ADMIN = 'admin'
    ORGANIZER = 'organizer'
    PARTICIPANT = 'participant'

    def __str__(self):
        return self.name


class User(AbstractUser):
    avatar = CloudinaryField('avatar')
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.PARTICIPANT)

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

    category_id = models.ForeignKey(Category, null=False, on_delete=models.RESTRICT)

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


class Ticket(Interaction):
    qr_code = models.CharField(max_length=255, null=False, unique=True)
    status = models.CharField(max_length=20, null=False, default=StatusTicket.BOOKED)


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
    amount = models.BigIntegerField(null=False, default=0)
    payment_method = models.CharField(
        max_length=20,
        choices=TypePayment.choices,
        default=TypePayment.VNPAY)
    transaction_id = models.CharField(max_length=255, null=False)
    status = models.CharField(
        max_length=20,
        choices=StatusPayment.choices,
        null=False
    )


class PaymentTicket(models.Model):
    user_id = models.ForeignKey(User, null=False, on_delete=models.RESTRICT)
    ticket_id = models.ForeignKey(Ticket, null=False, on_delete=models.RESTRICT)
    payment_id = models.ForeignKey(Payment, null=False, on_delete=models.RESTRICT)

    class Meta:
        unique_together = ('user_id', 'ticket_id', 'payment_id')