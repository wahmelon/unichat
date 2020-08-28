# chat/consumers.py
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import time
from .models import Topic, Comment
from authentication.models import StudentUser

class ChatConsumer(WebsocketConsumer): 

    def connect(self):
        self.room_group_name = self.scope['url_route']['kwargs']['topic_id']
        print('WS connecting to:', self.room_group_name)

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
        print('receiving: ', text_data)
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
    def websocket_message(self, event):
        print('id is: ', self.room_group_name)
        print('sending: ', event)
        # Send message to WebSocket
        #save message to DB
        topic_as_django_obj = Topic.objects.get(id=self.room_group_name)
        if event['action'] == 'topic_upvote':
            topic_as_django_obj.upvotes += 1
            topic_as_django_obj.save()
            print('updated?',topic_as_django_obj.as_dict())
            self.send(text_data=json.dumps(topic_as_django_obj.as_dict()))
        elif event['action'] == 'topic_downvote':
            topic_as_django_obj.downvotes += 1
            topic_as_django_obj.save()
            print('updated?',topic_as_django_obj.as_dict())
            self.send(text_data=json.dumps(topic_as_django_obj.as_dict()))
        elif event['action'] == 'comment':
            print('got comment')
            poster = StudentUser.objects.get(username=event['poster'])
            new_comment = Comment(
                poster=poster,
                content=event['content'],
                created_time=event['created_time'],
                topic_owner=topic_as_django_obj,
                upvotes=0,
                downvotes=0
                )
            new_comment.save()
            print('updated?', topic_as_django_obj.as_dict())
            self.send(text_data=json.dumps(topic_as_django_obj.as_dict()))
            print('comment created successfully')

            #may not send updated! do i need to get object again to ensure object loaded with updated data?




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



