from celery import shared_task
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Event, PaymentTicket, Notification, StatusTicket, StatusNotification, EventDate
from .utils import send_push_notification

@shared_task
def send_event_reminders():
    now = timezone.now()
    reminder_time = now + timedelta(hours=24)  # 24 giờ trước sự kiện
    event_dates = EventDate.objects.filter(
        event__active=True,
        event_date__gte=now.date(),
        event_date__lte=reminder_time.date()
    )

    for event_date in event_dates:
        event = event_date.event
        start_datetime = timezone.make_aware(
            datetime.combine(event_date.event_date, event_date.start_time)
        )
        if now <= start_datetime <= reminder_time:
            payment_tickets = PaymentTicket.objects.filter(
                ticket__event_date__event=event,
                status__in=[StatusTicket.BOOKED, StatusTicket.CHECKIN]
            ).select_related('user')

            for pt in payment_tickets:
                user = pt.user
                if user.fcm_token:
                    title = f"Nhắc nhở: Sự kiện {event.title} sắp diễn ra!"
                    body = f"Sự kiện sẽ diễn ra vào {start_datetime.strftime('%Y-%m-%d %H:%M')} tại {event.location_name}."
                    send_push_notification(user.fcm_token, title, body)

                    # Lưu thông báo vào database
                    Notification.objects.create(
                        user=user,
                        event=event,
                        content=body,
                        status=StatusNotification.NO_READ
                    )

# @shared_task
def send_event_update_notification(event_id):
    try:
        event = Event.objects.get(id=event_id, active=True)
        payment_tickets = PaymentTicket.objects.filter(
            ticket__event_date__event=event,
            status__in=[StatusTicket.BOOKED, StatusTicket.CHECKIN]
        ).select_related('user')

        for pt in payment_tickets:
            user = pt.user
            if user.fcm_token:
                title = f"Cập nhật: Sự kiện {event.title}"
                body = f"Sự kiện {event.title} đã được cập nhật. Vui lòng kiểm tra thông tin mới tại {event.location_name}."
                send_push_notification(user.fcm_token, title, body)

                # Lưu thông báo vào database
                Notification.objects.create(
                    user=user,
                    event=event,
                    content=body,
                    status=StatusNotification.NO_READ
                )
    except Event.DoesNotExist:
        print(f"Event with id {event_id} does not exist or is not active.")