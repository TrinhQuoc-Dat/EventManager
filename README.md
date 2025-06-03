# 🎉 Event Management App

Ứng dụng Quản lý Sự kiện giúp người dùng tạo, quản lý và tham gia các sự kiện một cách dễ dàng. Bao gồm hệ thống người dùng, đăng ký tham dự, quản lý vé, và thống kê sự kiện.

---

## 🧱 Công nghệ sử dụng

- 💻 **Frontend**: ReactJS + Axios + React Router DOM
- 🐍 **Backend**: Django REST Framework
- 🗄️ **Database**: MySQL
- 🔐 **Xác thực**: JWT (JSON Web Token)

---

## ⚙️ Cài đặt & Chạy ứng dụng

### 1. Clone dự án

```bash
git clone https://github.com/TrinhQuoc-Dat/EventManager.git
cd EventManager


cd backend
python -m venv venv
source venv/bin/activate  # Hoặc: venv\Scripts\activate (Windows)
pip install -r requirements.txt

# Cấu hình database trong `settings.py`
python manage.py makemigrations
python manage.py migrate

# Tạo superuser nếu cần
python manage.py createsuperuser

# Chạy server
python manage.py runserver

🔑 Các tính năng chính
 Đăng ký / Đăng nhập người dùng (JWT)

 Tạo / Cập nhật / Xóa sự kiện

 Đăng ký tham dự sự kiện

 Quản lý vé / QR code check-in

 Phân quyền quản trị viên và người dùng

 Thống kê số lượng người tham gia, lượt xem

 Upload ảnh sự kiện (Cloudinary/S3 hoặc local)

 Responsive giao diện người dùng

EventManager/
├── backend/
│   ├── manage.py
│   ├── event_app/ 
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── README.md

