from django.db import models
from django.contrib.auth.models import AbstractUser
from chathandler.models import Topic, Comment

class Unit(models.Model):
	unit_code = models.CharField(max_length=120)
	unit_name = models.CharField(max_length=120)
	university = models.CharField(max_length=120)
	def __str__(self):
		return self.unit_code

class StudentUser(AbstractUser):
	current_units = models.ManyToManyField(Unit, related_name = "units_list")
	faculty = models.CharField(max_length=120)
	university = models.CharField(max_length=120)
	karma = models.PositiveSmallIntegerField(default=0)
	topics_posted = models.ManyToManyField(Topic, blank=True)
	comments_posted = models.ManyToManyField(Comment, blank=True)

	def __str__(self):
		return "%s: %s" % (self.email, self.username)

	
# Create your models here.
