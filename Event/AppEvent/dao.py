from .models import Category, User, Event, Ticket, PaymentTicket, Payment


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


def get_ticket():
    return Ticket.objects.filter(active=True).all()


def get_user_tickets(user):
    return PaymentTicket.objects.select_related('ticket', 'ticket__event').filter(user=user).all()


def get_ticket_by_event(event):
    tickets = Ticket.objects.select_related('event')
    return tickets.filter(event__id=event).all()


def get_payment_ticket():
    return PaymentTicket.objects.filter(active=True).all()


def get_payment_detail(user, pk):
    return PaymentTicket.objects.select_related('ticket', 'ticket__event', 'payment')\
        .filter(user=user, payment_id=pk).first()


def get_payment_by_user(user):
    return Payment.objects.filter(user=user, active=True).all()


def get_payments():
    return Payment.objects.filter(active=True).order_by("-id").all()
