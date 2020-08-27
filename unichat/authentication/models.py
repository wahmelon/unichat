from django.db import models
from django.contrib.auth.models import AbstractUser
from chathandler.models import Topic, Comment

class Group(models.Model): #should be class Group
	group_code = models.CharField(max_length=120) 
	group_name = models.CharField(max_length=120) 
	parent_organisation = models.CharField(max_length=120) 
	def __str__(self):
		return self.group_code

class StudentUser(AbstractUser):
	current_groups = models.ManyToManyField(Group, related_name = "groups_list")
	faculty = models.CharField(max_length=120)
	university = models.CharField(max_length=120)
	karma = models.PositiveSmallIntegerField(default=0)
	topics_posted = models.ManyToManyField(Topic, blank=True)
	comments_posted = models.ManyToManyField(Comment, blank=True)

	def __str__(self):
		return self.username

	
# Create your models here.
