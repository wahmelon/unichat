from django.contrib import admin
from .models import StudentUser, Group

class StudentUserAdmin(admin.ModelAdmin):
	model = StudentUser

admin.site.register(StudentUser, StudentUserAdmin)
admin.site.register(Group)


# Register your models here.
