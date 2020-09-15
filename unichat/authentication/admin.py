from django.contrib import admin
from .models import StudentUser, Group, NotificationItem, ParticipatingUser

class StudentUserAdmin(admin.ModelAdmin):
	model = StudentUser

admin.site.register(StudentUser, StudentUserAdmin)
admin.site.register(Group)
admin.site.register(NotificationItem)
admin.site.register(ParticipatingUser)


# Register your models here.
