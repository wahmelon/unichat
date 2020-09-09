from django.contrib import admin
from .models import StudentUser, Group, NotificationItem

class StudentUserAdmin(admin.ModelAdmin):
	model = StudentUser

admin.site.register(StudentUser, StudentUserAdmin)
admin.site.register(Group)
admin.site.register(NotificationItem)


# Register your models here.
