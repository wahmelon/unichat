# chat/consumers.py
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import time
from .models import Topic, Comment
from authentication.models import StudentUser, Group, NotificationItem, ParticipatingUser

class ChatConsumer(WebsocketConsumer): 
    #
    def get_user_groups(self):
        user_id = self.scope['url_route']['kwargs']['user_id']   
        current_user_django_obj = StudentUser.objects.get(id=int(user_id))
        group_queryset = current_user_django_obj.current_groups.all()
        return [str(group) for group in group_queryset] #returns list of group name friendly UNITCODES
        #UNITCODES MUST BE ALPHANUMERAL HYPHEN OR PERIOD
    
    def get_participating_users(event_dict):
        existing_item = NotificationItem.objects.get(topic_id=event_dict['topic_id'], action_type=event_dict['action'])
        participating_users_array = []
        for participating_user in existing_item.participating_users:
            participating_users_array.append(
                {'username' : participating_user.user.username, 'id' : participating_user.user.id, 'time' : participating_user.time}

                )
        return participating_users_array        

    def update_or_create_notification_item(event_dict):
        user_obj = StudentUser.objects.get(id=event_dict['logged_user_id'])
        try:
            existing_item = NotificationItem.objects.get(topic_id=event_dict['topic_id'], action_type=event_dict['action'])
            does_not_exist_flag = False
            for participating_user in existing_item.participating_users:
                if participating_user.user == user_obj:
                    participating_user.time = event_dict['time']#updates time field to most recent for that user
                    participating_user.save()
                    does_not_exist_flag = True
                    break
            if (does_not_exist_flag):            
                new_participation = ParticipatingUser(
                    user = user_obj,
                    time = event_dict['time']
                )
                new_participation.save()
                existing_item.participating_users.add(new_participation)
            existing_item.action_time = event_dict['time'] #update most recent so notif items can be sorted by time
            existing_item.save()
        except:
            topic_as_django_obj = Topic.objects.get(id=event_dict['topic_id'])
            new_notification = NotificationItem(
                topic_id = event_dict['topic_id'],
                #comment_id = models.PositiveSmallIntegerField(blank=True)
                action_type = event_dict['action'],
                action_time = event_dict['time'],
                og_topic_owner = topic_as_django_obj.poster
                )

            new_notification.save()
            new_participation = ParticipatingUser(
                user = StudentUser.objects.get(id=event_dict['logged_user_id']),
                time = event_dict['time']
                )
            new_participation.save()
            new_notification.participating_users.add(new_participation)
            # below: notifs relating to comment require extra fields, optional on the notificationitem model
            if event_dict['action'] == 'add_comment':
                new_notification.og_comment_owner = StudentUser.objects.get(id=event_dict['logged_user_id'])
            elif event_dict['action'] == 'comment_upvote' or event_dict['action'] == 'comment_downvote':
                comment_django_obj = Comment.objects.get(id=event_dict['comment_id'])
                new_notification.og_comment_owner = comment_django_obj.poster
            new_notification.save()
            topic_as_django_obj.history.add(new_notification)
            topic_as_django_obj.save()

    def update_topic(event_dict):
        
        topic = Topic.objects.get(id=event_dict['topic_id'])
        if event_dict['action'] == 'topic_upvote':
            topic_as_django_obj.upvotes += 1
        else:
            topic_as_django_obj.downvotes += 1
        topic_as_django_obj.save()

    def update_comment(event_dict):
        comment_django_obj = Comment.objects.get(id=event['comment_id'])
        if event_dict['action'] == 'comment_upvote':
            comment_django_obj.upvotes += 1
        else:
            comment_django_obj.downvotes +=1
        comment_django_obj.save()

    def add_follow(event_dict):
        actor = StudentUser.objects.get(id=event_dict['logged_user_id'])
        topic_as_django_obj = Topic.objects.get(id=event_dict['topic_id'])
        topic_as_django_obj.followed_by.add(actor)
        topic_as_django_obj.save()

    def get_topic_followers(event_dict):
        topic_as_django_obj = Topic.objects.get(id=event_dict['topic_id'])
        return [user.id for user in topic_as_django_obj.followed_by.all()]


    def connect(self):

        self.accept()

        user_groups = self.get_user_groups()
        for group in user_groups:

        # Join room group
            async_to_sync(self.channel_layer.group_add)(
            group,
            self.channel_name
            )

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

        # Receive message from room group
    def websocket_message(self, event):
        # Send message to WebSocket
        #save message to DB
        if event['action'] == 'topic_upvote' or event['action'] == 'topic_downvote':
            add_follow(event)
            update_or_create_notification_item(event)

            update_topic(event)
            topic_as_django_obj = Topic.objects.get(id=event_dict['topic_id'])
            event['participating_users'] = get_participating_users(event)
            event['followers'] = get_topic_followers(event)
            event['og_topic_poster'] = topic_as_django_obj.poster.id
            event['og_poster_name'] = topic_as_django_obj.poster.username

            self.send(json.dumps(event))

        elif event['action'] == 'comment_upvote' or event['action'] == 'comment_downvote':
            add_follow(event)
            update_or_create_notification_item(event)

            update_comment(event)
            comment_django_obj = Comment.objects.get(id=event['comment_id'])
            payload = comment_django_obj.as_dict()
            payload['action'] = event['action']
            payload['followers'] = get_topic_followers(event)
            payload['og_comment_poster'] = comment_django_obj.poster.id
            payload['og_poster_name'] = comment_django_obj.poster.username
            payload['participating_users'] = get_participating_users(event)
            payload.update(event)
            self.send(json.dumps(payload))

        elif event['action'] == 'add_comment':
            add_follow(event)
            update_or_create_notification_item(event)

            topic_as_django_obj = Topic.objects.get(id=event['topic_id'])
            comment_poster = StudentUser.objects.get(id=event['logged_user_id'])

            new_comment = Comment(
                poster=comment_poster,
                content=event['content'],
                created_time=event['time'],
                topic_owner=topic_as_django_obj,
                upvotes=0,
                downvotes=0
                )
            new_comment.save()
            #adding fields to event
            event['comment_id'] = new_comment.id
            event['downvotes'] = 0
            event['upvotes'] = 0
            event['followers'] = [user.id for user in topic_as_django_obj.followed_by.all()]
            event['og_topic_poster'] = topic_as_django_obj.poster.id
            event['og_poster_name'] = topic_as_django_obj.poster.username
            event['participating_users'] = get_participating_users(event)

            self.send(json.dumps(event))

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



