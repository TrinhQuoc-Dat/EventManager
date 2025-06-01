from rest_framework import permissions
from AppEvent.models import UserRole
from .models import PaymentTicket, EventDate, StatusPayment
from django.utils import timezone
from datetime import datetime


class OwnerAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return request.user == obj.user


class IsOrganizer(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'organizer'
    
    def has_object_permission(self, request, view, obj):
        return request.user == obj.organizer

class IsOwnerOrganizer(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'organizer'
    
    def has_object_permission(self, request, view, obj):
        return request.user == obj.event.organizer

class IsOwnerTicketType(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'organizer'
    
    def has_object_permission(self, request, view, obj):
        return request.user == obj.event_date.event.organizer
    
class UserPermission(permissions.BasePermission):
    def get_permissions(self):
        if self.action.__eq__('current_user'):
            return [permissions.IsAuthenticated]

        return [permissions.AllowAny]

# class IsCommentOwner(permissions.IsAuthenticated):
#     def has_object_permission(self, request, view, comment):
#         return super().has_permission(request, view) and request.user == comment.user
#     def has_permission(self, request, view):
#         return request.user and request.user.is_authenticated

#     def has_object_permission(self, request, view, comment):
#         return request.user == comment.user

class CanComment(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method != "POST":
            return True  # Cho phép GET comments

        # Lấy event từ pk trong URL
        event_id = view.kwargs.get('pk')
        if not event_id:
            return False

        try:
            # Kiểm tra xem người dùng đã mua vé chưa
            has_purchased = PaymentTicket.objects.filter(
                user=request.user,
                ticket__event_date__event_id=event_id,
                payment__status=StatusPayment.SUCCESS
            ).exists()

            if not has_purchased:
                return False

            # Kiểm tra sự kiện đã kết thúc
            event_dates = EventDate.objects.filter(event_id=event_id)
            current_time = timezone.now()
            is_ended = all(
                datetime.combine(date.event_date, date.end_time, tzinfo=timezone.get_current_timezone()) < current_time
                for date in event_dates
            )

            return is_ended

        except EventDate.DoesNotExist:
            return False