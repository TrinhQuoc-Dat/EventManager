from rest_framework import permissions
from AppEvent.models import UserRole


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