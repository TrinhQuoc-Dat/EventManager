from django.contrib import admin
from django.contrib.auth.models import Permission, Group
from django.db.models import Count
from django.template.response import TemplateResponse
from django.utils.safestring import mark_safe
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django import forms
from django.urls import path
from AppEvent.models import Category, User, Event, Like, Notification, Comment, PaymentTicket, Payment, TicketType, EventDate, DiscountCode
from AppEvent import dao
from django.utils.html import format_html


class EventAppAdminSite(admin.AdminSite):
    site_header = "Quản Lý Sự Kiện"

    def get_urls(self):
        return [
            path('event/reports/', self.admin_view(self.reports_view), name='reports')
        ] + super().get_urls()

    def reports_view(self, request):
        total_users = dao.get_count_user()
        total_events = dao.get_count_event()
        total_tickets = dao.get_count_ticket()

        context = {
            'total_users': total_users,
            'total_events': total_events,
            'total_tickets': total_tickets
        }

        return TemplateResponse(request, 'admin/reports.html', context=context)


class GroupForm(forms.ModelForm):
    permissions = forms.ModelMultipleChoiceField(
        queryset=Permission.objects.all(),
        widget=admin.widgets.FilteredSelectMultiple("Permissions", is_stacked=False),
        required=False
    )

    class Meta:
        model = Group
        fields = ('name', 'permissions')


class GroupAdmin(admin.ModelAdmin):
    form = GroupForm
    list_display = ['name']
    search_fields = ['name']

class EventForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)
    class Meta:
        model = Event
        fields = '__all__'

class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'description', 'created_date', 'location', 'view_dashboard']
    search_fields = ['name', 'category']
    list_filter = ['category', 'created_date']
    ordering = ['-id']
    readonly_fields = ('image_view',)
    form = EventForm

    def image_view(self, event):
        if event:
            return mark_safe(f"<img src='{event.image.url}' width='120'/>")
        return "Không có ảnh"

    def view_dashboard(self, obj):
        return format_html('<a href="/admin/event/reports/" class="button">📊 Xem thống kê</a>')

    view_dashboard.short_description = "Thống kê"

    class Media:
        css = {
            'all': ('/static/css/style.css',)
        }
        js = {
            'js': ('/static/js/script.js',)
        }


class UserAdmin(admin.ModelAdmin):
    class Media:
        model = User
        fields = '__all__'

    def save(self, commit=True):
        user = super().save(commit=False)
        if self.cleaned_data.get('password'):
            user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user


admin_site = EventAppAdminSite(name='Admin Site')


admin_site.register(Category)
admin_site.register(Event, EventAdmin)
admin_site.register(Payment)
admin_site.register(PaymentTicket)
# admin_site.register(Ticket)
admin_site.register(Comment)
admin_site.register(Like)
admin_site.register(Notification)
admin_site.register(TicketType)
admin_site.register(EventDate)
admin_site.register(DiscountCode)

admin_site.register(Group, GroupAdmin)
admin_site.register(User, UserAdmin)

