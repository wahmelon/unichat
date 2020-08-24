# chat/consumers.py
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import time

class ChatConsumer(WebsocketConsumer):

	def connect(self):
		self.room_group_name = self.scope['url_route']['kwargs']['university']

        # Join room group
		async_to_sync(self.channel_layer.group_add)(
			self.room_group_name,
			self.channel_name
		)

		self.accept()

	def disconnect(self, close_code):
        # Leave room group
		async_to_sync(self.channel_layer.group_discard)(
			self.room_group_name,
			self.channel_name
		)

    # Receive message from WebSocket
	def receive(self, text_data):
		text_data_json = json.loads(text_data)
        # Send message to room group
		async_to_sync(self.channel_layer.group_send)(self.room_group_name, text_data_json)

    # def get_last_20(self, event):
    #     last_available_message_time = event['timeid']
    #     last_20_messages = [obj.as_dict() for obj in Message.objects.filter(time__lte=last_available_message_time)[:20]]
    #     if len(last_20_messages) > 0:
    #         for item in last_20_messages:
    #             message = {
    #                 'type' : 'chat_message',
    #                 'author': item['author'],
    #                 'timeid' : item['time'],
    #                 'content' : item['message']
    #             }
    #             self.send(text_data=json.dumps(message))


            #__lte (double underscore lte is special django model queryset api syntax)
            #self.send(text_data=json.dumps(Message.get_last_20(current_milli_time)))
    
    # Receive message from room group
	def chat_message(self, event):
        # Send message to WebSocket
		self.send(text_data=json.dumps(event))
        #save message to DB    
        # message_to_django = Message(
        #     author = event['author'],
        #     message = event['content'],
        #     time = event['timeid']
        #     )
        # message_to_django.save()

    # def video_post(self, event):

    #     vid_post_to_django = Videopost( 
    #         ip_origin = event['ip_origin'],
    #         post_time = event['post_time'],
    #         youtube_url = event['youtube_url'],
    #         skip_counter = event['skip_counter']
    #         )
    #     vid_post_to_django.save()



