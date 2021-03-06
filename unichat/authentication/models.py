from django.db import models
from django.contrib.auth.models import AbstractUser
from chathandler.models import Topic, Comment

class Group(models.Model): #should be class Group
	group_code = models.CharField(max_length=120) 
	group_name = models.CharField(max_length=120) 
	parent_organisation = models.CharField(max_length=120)


	def __str__(self):
		return self.group_code

class HistoryItem(models.Model):
	topic = models.ForeignKey(Topic, related_name = 'historical_topic', on_delete = models.PROTECT)
	time= models.BigIntegerField(),
	action = models.CharField(max_length=120)

	def as_dict(self):
		text = None
		if action == "topic_upvote" or action == "topic_downvote":
			text = "You voted on a topic: "
		elif action == "comment_upvote" or action == "comment_downvote":
			text = "You voted on a comment in: "
		elif action == "add_comment":
			text = "You commented in: "

		topic_text = str(self.topic.content)
		if len(topic_text) > 29:
			topic_text = topic_text[0:29]
		topic_text = topic_text  + "..."
		final_text = text + topic_text

		new_dict = {
		"text": final_text,
		"time" : self.time,
		"topic_id": self.topic.id
		}

		return new_dict


class StudentUser(AbstractUser):
	current_groups = models.ManyToManyField(Group, related_name = "student_user")
	faculty = models.CharField(max_length=120)
	university = models.CharField(max_length=120)
	karma = models.PositiveSmallIntegerField(default=0)
	topics_posted = models.ManyToManyField(Topic, blank=True)
	comments_posted = models.ManyToManyField(Comment, blank=True)
	interaction_history = models.ManyToManyField(HistoryItem, blank = True)


	def __str__(self):
		return self.username

class ParticipatingUser(models.Model):
	user = models.ForeignKey(StudentUser, related_name = 'user', on_delete = models.PROTECT)
	time = models.BigIntegerField()


class Report(models.Model):
	user_reporting = models.ForeignKey(StudentUser, related_name = 'user_reporting', on_delete = models.PROTECT)
	reported_user = models.ForeignKey(StudentUser, related_name = 'reported_user', on_delete = models.PROTECT)
	action_taken = models.CharField(max_length=500,blank=True, null=True) #for admin to record action
	relevant_topic = models.ForeignKey(Topic, blank=True, related_name = 'topic_concerned', on_delete = models.PROTECT)
	relevant_comment = models.ForeignKey(Comment, blank =True, related_name = 'comment_concerned', on_delete = models.PROTECT)
	additional_comments = models.CharField(max_length=500,blank=True, null=True)


class NotificationItem(models.Model):
	topic_id = models.PositiveSmallIntegerField()
	og_topic_owner = models.ForeignKey(StudentUser, related_name = 'topic_notifications', on_delete=models.PROTECT)
	comment_id = models.PositiveSmallIntegerField(blank=True, null=True)
	og_comment_owner = models.ForeignKey(StudentUser, blank=True, null=True, related_name = 'comment_notification', on_delete=models.PROTECT)
	action_type = models.CharField(max_length=120) #commented on topic, upvoted topic, downvoted topic, upvoted comment, downvoted comment
	participating_users = models.ManyToManyField(ParticipatingUser, related_name = 'participating_users') #users that have commented.. field name shoudl be changed to be more specifc 
	action_time = models.BigIntegerField()

	def __str__(self):
		return self.action_type

	def as_dict(self):

		participating_users = self.participating_users.all()

		notif_dict = {
		'topic_id' : self.topic_id,
		'og_topic_owner' : self.og_topic_owner,
		'action_type' : self.action_type,
		'participating_users' : [participating_user.user.username for participating_user in participating_users],
		'action_time' : self.action_time,
		}

		if self.comment_id:
			notif_dict['og_comment_owner'] = self.og_comment_owner
			notif_dict['comment_id'] = self.comment_id
		return notif_dict

	class Meta:
		ordering = ['-action_time']
# Create your models here.



