from django.db import models
#from authentication.models import Group, StudentUser

class Topic(models.Model):
	audience = models.ForeignKey("authentication.Group", on_delete=models.CASCADE)
	poster = models.ForeignKey("authentication.StudentUser", on_delete=models.CASCADE)
	content = models.TextField()
	created_time = models.BigIntegerField()
	upvotes = models.PositiveSmallIntegerField(default=0)
	downvotes = models.PositiveSmallIntegerField(default=0)
	#time field should be created by a Date.now() function in frontend
	def as_dict(self):
		return {
		'poster' : self.poster,
		'content' : self.content,
		'created_time' : self.created_time
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
	topic_owner = models.ForeignKey(Topic, on_delete=models.CASCADE)

	def __str__(self):
		return self.content

	class Meta:
		ordering = ['created_time']
