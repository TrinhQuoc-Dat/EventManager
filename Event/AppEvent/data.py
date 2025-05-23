from AppEvent.models import *
from django.contrib.auth import get_user_model
from django.utils import timezone
import random

User = get_user_model()

# Avatar mặc định
# default_avatar = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'

# Danh sách dữ liệu giả
users_data = [
    {
        'username': 'admin1',
        'password': 'admin123',
        'first_name': 'Admin',
        'last_name': 'One',
        'email': 'admin1@example.com',
        'role': UserRole.ADMIN,
        'is_superuser': True,
        'is_staff': True,
    },
    {
        'username': 'organizer1',
        'password': 'org123',
        'first_name': 'Minh',
        'last_name': 'Pham',
        'email': 'minhp@example.com',
        'role': UserRole.ORGANIZER,
        'is_superuser': False,
        'is_staff': True,
    },
    {
        'username': 'organizer2',
        'password': 'org456',
        'first_name': 'Thị',
        'last_name': 'Lê',
        'email': 'leth@example.com',
        'role': UserRole.ORGANIZER,
        'is_superuser': False,
        'is_staff': True,
    },
    {
        'username': 'participant1',
        'password': 'part123',
        'first_name': 'An',
        'last_name': 'Nguyễn',
        'email': 'annguyen@example.com',
        'role': UserRole.PARTICIPANT,
        'is_superuser': False,
        'is_staff': False,
    },
    {
        'username': 'participant2',
        'password': 'part456',
        'first_name': 'Bình',
        'last_name': 'Trần',
        'email': 'binhtran@example.com',
        'role': UserRole.PARTICIPANT,
        'is_superuser': False,
        'is_staff': False,
    },
]

# # Tạo user
# for u in users_data:
#     user = User.objects.create_user(
#         username=u['username'],
#         password=u['password'],
#         email=u['email'],
#         first_name=u['first_name'],
#         last_name=u['last_name'],
#         role=u['role'],
#         avatar=default_avatar,
#         is_superuser=u['is_superuser'],
#         is_staff=u['is_staff'],
#         is_active=True,
#         date_joined=timezone.now()
#     )


cat_music = Category.objects.create(name='Âm nhạc')
cat_tech = Category.objects.create(name='Công nghệ')
cat_art = Category.objects.create(name='Nghệ thuật')

events = [
    {
        'title': 'Đêm nhạc Acoustic Hà Nội',
        'description': 'Một buổi tối tràn ngập âm nhạc mộc mạc, sâu lắng cùng các nghệ sĩ indie nổi tiếng.',
        'location': 'Phố đi bộ Hồ Gươm, Hà Nội',
        'category': cat_music
    },
    {
        'title': 'Hội thảo AI Việt Nam 2025',
        'description': 'Cập nhật xu hướng trí tuệ nhân tạo, giao lưu chuyên gia và trình diễn công nghệ mới.',
        'location': 'Trung tâm Hội nghị Quốc gia',
        'category': cat_tech
    },
    {
        'title': 'Triển lãm Tranh hiện đại',
        'description': 'Trưng bày các tác phẩm hội họa hiện đại của các hoạ sĩ trẻ tài năng.',
        'location': 'Bảo tàng Mỹ thuật TP.HCM',
        'category': cat_art
    },
]

event_objs = []
for e in events:
    event = Event.objects.create(
        title=e['title'],
        description=e['description'],
        date_time=timezone.now() + timezone.timedelta(days=random.randint(3, 30)),
        image="https://res.cloudinary.com/dmt3j04om/image/upload/v1747452317/tge2fh5zwxijc7zpnuyz.jpg",
        location=e['location'],
        ticket_quantity=100,
        category=e['category']
    )






