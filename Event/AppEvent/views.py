from rest_framework import viewsets, generics, permissions, mixins, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Event, Comment, User
from AppEvent import dao, serializers, paginations


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView):
    queryset = dao.get_categories()
    serializer_class = serializers.CategorySerializer
    permission_classes = [permissions.AllowAny]


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveAPIView):
    queryset = dao.get_user()
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action.__eq__('current_user'):
            return [permissions.IsAuthenticated]

        return [permissions.AllowAny]

    @action(methods=['get'], url_name='current_user', detail=False)
    def current_user(self, request):
        return Response(serializers.UserSerializer(request.user).data)

    @action(methods=['post'], url_name='logout', detail=False)
    def logout(self, request):
        if request.auth:
            request.auth.delete()
        return Response({"detail": "Đăng xuất thành công"})


class EventViewSet(viewsets.ModelViewSet):
    queryset = dao.get_events()
    parser_classes = [parsers.MultiPartParser]
    serializer_class = serializers.EventSerializer
    pagination_class = paginations.EventSetPagination


