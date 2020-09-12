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
	current_groups = models.ManyToManyField(Group, related_name = "student_user")
	faculty = models.CharField(max_length=120)
	university = models.CharField(max_length=120)
	karma = models.PositiveSmallIntegerField(default=0)
	topics_posted = models.ManyToManyField(Topic, blank=True)
	comments_posted = models.ManyToManyField(Comment, blank=True)

	def __str__(self):
		return self.username

class NotificationItem(models.Model):
	topic_id = models.PositiveSmallIntegerField()
	og_topic_owner = models.ForeignKey(StudentUser, related_name = 'topic_notifications', on_delete=models.PROTECT)
	comment_id = models.PositiveSmallIntegerField(blank=True, null=True)
	og_comment_owner = models.ForeignKey(StudentUser, blank=True, null=True, related_name = 'comment_notification', on_delete=models.PROTECT)
	action_type = models.CharField(max_length=120) #commented on topic, upvoted topic, downvoted topic, upvoted comment, downvoted comment
	action_value = models.PositiveSmallIntegerField(default=0) #how many people have performed this action
	participating_users = models.ManyToManyField(StudentUser, related_name = 'participating_users') #users that have commented
	action_time = models.BigIntegerField()
	last_actor = models.CharField(max_length=120) #for adding to the notification text: Laura and 12 others upvoted your comment

	def __str__(self):
		return self.action_type
	class Meta:
		ordering = ['-action_time']
# Create your models here.
