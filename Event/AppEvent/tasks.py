# tasks.py
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Event, PaymentTicket, Notification, StatusTicket, StatusNotification
from .utils import send_push_notification

@shared_task
def send_event_reminders():
    now = timezone.now()
    reminder_time = now + timedelta(hours=24)  # 24 giờ trước sự kiện
    events = Event.objects.filter(
        active=True,
        start_date_time__gte=now,
        start_date_time__lte=reminder_time
    )

    for event in events:
        # Lấy danh sách người dùng đã mua vé
        payment_tickets = PaymentTicket.objects.filter(
            ticket__event=event,
            status__in=[StatusTicket.BOOKED, StatusTicket.CHECKIN]
        ).select_related('user')

        for pt in payment_tickets:
            user = pt.user
            if user.fcm_token:
                title = f"Nhắc nhở: Sự kiện {event.title} sắp diễn ra!"
                body = f"Sự kiện sẽ diễn ra vào {event.start_date_time.strftime('%Y-%m-%d %H:%M')} tại {event.location_name}."
                send_push_notification(user.fcm_token, title, body)

                # Lưu thông báo vào database
                Notification.objects.create(
                    user=user,
                    event=event,
                    content=body,
                    status=StatusNotification.NO_READ
                )