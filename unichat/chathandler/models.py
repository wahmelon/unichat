from django.db import models
#from authentication.models import Group, StudentUser

class Topic(models.Model):
	audience = models.ForeignKey("authentication.Group", on_delete=models.CASCADE, related_name='topics')
	poster = models.ForeignKey("authentication.StudentUser", on_delete=models.CASCADE)
	content = models.TextField()
	created_time = models.BigIntegerField()
	upvotes = models.PositiveSmallIntegerField(default=0)
	downvotes = models.PositiveSmallIntegerField(default=0)
	#time field should be created by a Date.now() function in frontend
	def as_dict(self):


		return {
		'audience' : str(self.audience),
		'poster' : str(self.poster),
		'content' : self.content,
		'created_time' : self.created_time,
		'upvotes' : self.upvotes,
		'downvotes' : self.downvotes,
		'comments' : self.comments.all().order_by('created_time') #comments is thru related name specified on comment model next to foreignkey relationship
		}

	def __str__(self):
		return self.content

	class Meta:
		ordering = ['created_time']

class Comment(models.Model):
	poster = models.ForeignKey("authentication.StudentUser", on_delete=models.CASCADE)
	content = models.TextField()
	created_time = models.BigIntegerField()
	upvotes = models.PositiveSmallIntegerField()
	downvotes = models.PositiveSmallIntegerField()	
	#time field should be created by a Date.now() function in frontend
	topic_owner = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name = 'comments')

	def __str__(self):
		return self.content

	class Meta:
		ordering = ['created_time']
