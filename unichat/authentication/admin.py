from django.contrib import admin
from .models import StudentUser, Unit

class StudentUserAdmin(admin.ModelAdmin):
	model = StudentUser

admin.site.register(StudentUser, StudentUserAdmin)
admin.site.register(Unit)


# Register your models here.
