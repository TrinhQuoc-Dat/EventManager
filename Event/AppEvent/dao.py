from .models import Category, User, Event


def get_categories():
    return Category.objects.all()


def get_user():
    return User.objects.filter(is_active=True).all()


def get_events():
    return Event.objects.filter(active=True).all()
