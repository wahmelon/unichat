from django.contrib import admin
from .models import StudentUser

class StudentUserAdmin(admin.ModelAdmin):
	model = StudentUser

admin.site.register(StudentUser, StudentUserAdmin)

# Register your models here.
