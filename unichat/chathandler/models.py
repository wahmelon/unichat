from django.db import models
#from authentication.models import Group, StudentUser

class Topic(models.Model):
	audience = models.ForeignKey("authentication.Group", on_delete=models.CASCADE, related_name='topics')
	poster = models.ForeignKey("authentication.StudentUser", on_delete=models.CASCADE)
	content = models.TextField()
	created_time = models.BigIntegerField()
	upvotes = models.PositiveSmallIntegerField(default=0)
	downvotes = models.PositiveSmallIntegerField(default=0)
	posted_as_anonymous = models.BooleanField(default=True)
	followed_by = models.ManyToManyField("authentication.StudentUser", related_name = "topics_followed")
	history = models.ManyToManyField("authentication.NotificationItem", related_name = "history")
	time_of_last_comment = models.BigIntegerField(default=0)

	def as_dict(self):

		return {
		'topic_id' : self.id,
		'posted_as_anonymous' : self.posted_as_anonymous,
		'audience' : str(self.audience),
		'poster' : str(self.poster),
		'content' : self.content,
		'created_time' : self.created_time,
		'upvotes' : self.upvotes,
		'downvotes' : self.downvotes,
		'comments' : [comment.as_dict() for comment in self.comments.all().order_by('created_time')],
		'followed_by' : [str(user) for user in self.followed_by.all()],
		'time_of_last_comment' : self.time_of_last_comment
		#comments is thru related name specified on comment model next to foreignkey relationship
		}

	def __str__(self):
		return self.content

	class Meta:
		ordering = ['-created_time']

class Comment(models.Model):
	poster = models.ForeignKey("authentication.StudentUser", on_delete=models.CASCADE)
	content = models.TextField()
	created_time = models.BigIntegerField()
	upvotes = models.PositiveSmallIntegerField()
	downvotes = models.PositiveSmallIntegerField()	
	#time field should be created by a Date.now() function in frontend
	topic_owner = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name = 'comments')

	def as_dict(self):

		return {
		'comment_id' : self.id,
		'poster' : str(self.poster),
		'content' : self.content,
		'created_time' : self.created_time,
		'upvotes' : self.upvotes,
		'downvotes' : self.downvotes
		}

	def __str__(self):
		return self.content

	class Meta:
		ordering = ['created_time']
