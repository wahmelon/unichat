from django.db import models
from django.contrib.auth.models import AbstractUser

class StudentUser(AbstractUser):
	current_units = models.CharField(blank=True, max_length=120)
	
# Create your models here.
