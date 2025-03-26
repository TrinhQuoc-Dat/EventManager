from .models import Category, User, Event, Ticket


def get_categories():
    return Category.objects.all()


def get_user():
    return User.objects.filter(is_active=True).all()


def get_events():
    return Event.objects.filter(active=True).all()


def get_count_user():
    return User.objects.count()


def get_count_event():
    return Event.objects.count()


def get_count_ticket():
    return Ticket.objects.count()


