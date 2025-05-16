from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AppEvent.settings')
app = Celery('AppEvent')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'send-event-reminders-every-hour': {
        'task': 'AppEvent.tasks.send_event_reminders',
        'schedule': 3600.0,  # 1 giờ
    },
}
