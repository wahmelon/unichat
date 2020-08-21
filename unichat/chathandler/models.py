from django.db import models

class Topic(models.Model):
	poster = models.TextField()
	content = models.TextField()
	created_time = models.BigIntegerField()
	upvotes = models.PositiveSmallIntegerField()
	downvotes = models.PositiveSmallIntegerField()
	#time field should be created by a Date.now() function in frontend
	def as_dict(self):
		return {
		'poster' : self.poster,
		'content' : self.content,
		'created_time' : self.created_time
		}

	def __str__(self):
		return "%s: %s" % (self.poster, self.content)

	class Meta:
		ordering = ['created_time']

class Comment(models.Model):
	poster = models.TextField()
	content = models.TextField()
	created_time = models.BigIntegerField()
	upvotes = models.PositiveSmallIntegerField()
	downvotes = models.PositiveSmallIntegerField()	
	#time field should be created by a Date.now() function in frontend
	topic_owner = models.ForeignKey(Topic, on_delete=models.CASCADE)

	def __str__(self):
		return "%s: %s" % (self.poster, self.content)

	class Meta:
		ordering = ['created_time']
