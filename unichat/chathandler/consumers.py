# chat/consumers.py
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import time
from .models import Topic, Comment
from authentication.models import StudentUser, Group, NotificationItem

class ChatConsumer(WebsocketConsumer): 
    #
    def get_user_groups(self):
        user_id = self.scope['url_route']['kwargs']['user_id']   
        current_user_django_obj = StudentUser.objects.get(id=int(user_id))
        group_queryset = current_user_django_obj.current_groups.all()
        return [str(group) for group in group_queryset] #returns list of group name friendly UNITCODES
        #UNITCODES MUST BE ALPHANUMERAL HYPHEN OR PERIOD

    def connect(self):

        self.accept()

        user_groups = self.get_user_groups()
        for group in user_groups:
        #self.room_group_name = self.scope['url_route']['kwargs']['user_id']


        # Join room group
            async_to_sync(self.channel_layer.group_add)(
            group,
            self.channel_name
            )
            #do i need async?
            #self.accept()


    def disconnect(self, close_code):
        user_groups = self.get_user_groups()

        # Leave room group
        for group in user_groups:
            async_to_sync(self.channel_layer.group_discard)(
            group,
            self.channel_name
            )

        # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(text_data_json['group_code'], text_data_json)
                                                #GROUP CODE SHOULD COME FROM WEBSOCKET MESSAGE


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
        # Send message to WebSocket
        #save message to DB
        if event['action'] == 'topic_upvote':
            upvoter = StudentUser.objects.get(id=event['logged_user_id'])
            topic_as_django_obj = Topic.objects.get(id=event['topic_id'])
            topic_as_django_obj.upvotes += 1
            topic_as_django_obj.followed_by.add(upvoter)
            topic_as_django_obj.save()
            self.send(json.dumps(event))
            if NotificationItem.objects.get(topic_id=event['topic_id'], action_type='topic_upvote'): #true if it exists
                existing_item = NotificationItem.objects.get(topic_id=event['topic_id'], action_type='topic_upvote')
                existing_item.action_value += 1
                existing_item.action_time = event['time']
                existing_item.action_time = event['logged_user_id']
            else:
                new_notification = NotificationItem(
                    topic_id = event['topic_id'],
                    #comment_id = models.PositiveSmallIntegerField(blank=True)
                    action_type = 'topic_upvote',
                    action_value = 1,
                    action_time = event['time'],
                    last_actor = event['logged_user_id']
                    )

        elif event['action'] == 'topic_downvote':
            downvoter = StudentUser.objects.get(id=event['logged_user_id'])
            topic_as_django_obj = Topic.objects.get(id=event['topic_id'])
            topic_as_django_obj.downvotes += 1
            topic_as_django_obj.followed_by.add(downvoter)
            topic_as_django_obj.save()
            self.send(json.dumps(event))
            if NotificationItem.objects.get(topic_id=event['topic_id'], action_type='topic_downvote'): #true if it exists
                existing_item = NotificationItem.objects.get(topic_id=event['topic_id'], action_type='topic_downvote')
                existing_item.action_value += 1
                existing_item.action_time = event['time']
                existing_item.action_time = event['logged_user_id']
            else:
                new_notification = NotificationItem(
                    topic_id = event['topic_id'],
                    #comment_id = models.PositiveSmallIntegerField(blank=True)
                    action_type = 'topic_downvote',
                    action_value = 1,
                    action_time = event['time'],
                    last_actor = event['logged_user_id']
                    )            

        elif event['action'] == 'add_comment':
            poster = StudentUser.objects.get(username=event['poster'])
            topic_as_django_obj = Topic.objects.get(id=event['topic_id'])
            topic_as_django_obj.followed_by.add(poster)

            new_comment = Comment(
                poster=poster,
                content=event['content'],
                created_time=event['created_time'],
                topic_owner=topic_as_django_obj,
                upvotes=0,
                downvotes=0
                )
            new_comment.save()
            #adding fields to event
            event['comment_id'] = new_comment.id
            event['downvotes'] = 0
            event['upvotes'] = 0
            self.send(json.dumps(event))

            if NotificationItem.objects.get(topic_id=event['topic_id'], action_type='add_comment'): #true if it exists
                existing_item = NotificationItem.objects.get(topic_id=event['topic_id'], action_type='add_comment')
                existing_item.action_value += 1
                existing_item.action_time = event['time']
                existing_item.action_time = event['logged_user_id']
            else:
                new_notification = NotificationItem(
                    topic_id = event['topic_id'],
                    #comment_id = models.PositiveSmallIntegerField(blank=True)
                    action_type = 'add_comment',
                    action_value = 1,
                    action_time = event['time'],
                    last_actor = event['logged_user_id']
                    )

        elif event['action'] == 'comment_upvote':
            upvoter = StudentUser.objects.get(id=event['logged_user_id'])
            comment_django_obj = Comment.objects.get(id=event['comment_id'])
            comment_django_obj.upvotes += 1
            topic_owner = comment_django_obj.topic_owner
            topic_owner.followed_by.add(upvoter)
            comment_django_obj.save()
            payload = comment_django_obj.as_dict()
            payload['action'] = 'comment_upvote'
            payload.update(event)
            self.send(json.dumps(payload))

            if NotificationItem.objects.get(topic_id=event['topic_id'], action_type='comment_upvote'): #true if it exists
                existing_item = NotificationItem.objects.get(topic_id=event['topic_id'], action_type='comment_upvote')
                existing_item.action_value += 1
                existing_item.action_time = event['time']
                existing_item.action_time = event['logged_user_id']
            else:
                new_notification = NotificationItem(
                    topic_id = event['topic_id'],
                    #comment_id = models.PositiveSmallIntegerField(blank=True)
                    action_type = 'comment_upvote',
                    action_value = 1,
                    action_time = event['time'],
                    last_actor = event['logged_user_id']
                    )            

        elif event['action'] == 'comment_downvote':
            downvoter = StudentUser.objects.get(id=event['logged_user_id'])            
            comment_django_obj = Comment.objects.get(id=event['comment_id'])
            comment_django_obj.downvotes += 1
            topic_owner = comment_django_obj.topic_owner
            topic_owner.followed_by.add(downvoter)
            comment_django_obj.save()
            payload = comment_django_obj.as_dict()
            payload['action'] = 'comment_downvote'
            payload.update(event)
            self.send(json.dumps(payload))
            if NotificationItem.objects.get(topic_id=event['topic_id'], action_type='comment_downvote'): #true if it exists
                existing_item = NotificationItem.objects.get(topic_id=event['topic_id'], action_type='comment_downvote')
                existing_item.action_value += 1
                existing_item.action_time = event['time']
                existing_item.action_time = event['logged_user_id']
            else:
                new_notification = NotificationItem(
                    topic_id = event['topic_id'],
                    #comment_id = models.PositiveSmallIntegerField(blank=True)
                    action_type = 'comment_downvote',
                    action_value = 1,
                    action_time = event['time'],
                    last_actor = event['logged_user_id']
                    )            


        elif event['action'] == 'add_topic':
            topic_poster = StudentUser.objects.get(id=event['user_id'])
            new_topic = Topic(
                audience=Group.objects.get(group_code=event['group_code']),
                content=event['content'],
                created_time=event['created_time'],
                poster=topic_poster,
                posted_as_anonymous = event['posted_as_anonymous'],
                upvotes=0,
                downvotes=0
                )
            new_topic.save()
            new_topic.followed_by.add(topic_poster)
            #adding fields to event
            event['topic_id'] = new_topic.id
            event['downvotes'] = 0
            event['upvotes'] = 0
            self.send(json.dumps(event))




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



