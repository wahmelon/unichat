from django.shortcuts import render
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import MyTokenObtainPairSerializer, StudentUserSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import StudentUser, Group, NotificationItem
from chathandler.models import Topic

def UserFromToken(request):
	jwt_object = JWTAuthentication()
	header = jwt_object.get_header(request)
	raw_token = jwt_object.get_raw_token(header)
	validated_token = jwt_object.get_validated_token(raw_token)
	return jwt_object.get_user(validated_token)	


class ObtainTokenPairWithCurrentGroupsView(TokenObtainPairView):
    #permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer

class StudentUserCreate(APIView):
	permission_classes = (permissions.AllowAny,)
	authentication_classes = ()

	def post(self, request, format='json'):
		serializer = StudentUserSerializer(data=request.data)
		if serializer.is_valid():
			user = serializer.save()
			if user:
				json = serializer.data
				return Response(json, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetUserGroups(APIView): #change to "get topic ids of user groups (or something similar)"
	def get(self, request):
		user = UserFromToken(request)
		django_user = StudentUser.objects.get(username=user.username)
		payload_list = []
		user_groups = [str(group) for group in django_user.current_groups.all()]
		for group in django_user.current_groups.all():
			for topic in group.topics.all()[:9]: #first 10 topics of each (BEFORE :9)

				if topic: #not no topics
					topic_id_and_when_created_dict = {}
					topic_id_and_when_created_dict['id'] = topic.id
					topic_id_and_when_created_dict['created_time'] = topic.created_time
					payload_list.append(topic_id_and_when_created_dict)
					# topic_comment_list.append(topic.as_dict())
			#topics has been set as related_name on foreign key params in Topic object referencing Group object #allowing this lookup
		# print(topic_comment_list)
		return Response(data={"user_id" : django_user.id, "user_groups" : user_groups, "topic_data": payload_list, "username":user.username,'faculty':user.faculty, 'university':user.university}, status=status.HTTP_200_OK)

class GetMoreTopics(APIView): #change to "get topic ids of user groups (or something similar)"
	def post(self, request):
		user = UserFromToken(request)
		django_user = StudentUser.objects.get(username=user.username)
		payload_list = []
		print(request)
		print(request.data)
		page = request.data['page'] #corresponds to page requirement for react-infinite-scroller
		user_groups = [str(group) for group in django_user.current_groups.all()]
		for group in django_user.current_groups.all():
			for topic in group.topics.all()[(page*10):((page*10)+9)]: #returns 10 items at a time BEFORE page*10,(page*10)+9

				if topic: #not no topics
					topic_id_and_when_created_dict = {}
					topic_id_and_when_created_dict['id'] = topic.id
					topic_id_and_when_created_dict['created_time'] = topic.created_time
					payload_list.append(topic_id_and_when_created_dict)
					# topic_comment_list.append(topic.as_dict())
			#topics has been set as related_name on foreign key params in Topic object referencing Group object #allowing this lookup
		# print(topic_comment_list)
		return Response(data={"topic_data": payload_list}, status=status.HTTP_200_OK)



class GetTopicData(APIView):
	def post (self, request):
		topic_id = request.data['topic_id']
		topic_django_object = Topic.objects.get(id=topic_id)
		topic_as_dict = topic_django_object.as_dict()
		return Response(data={"topic_data":topic_django_object.as_dict()}, status=status.HTTP_200_OK)

class GetNotifications(APIView):
	def post(self, request):
		user = UserFromToken(request)
		django_user = StudentUser.objects.get(username=user.username)
		payload_list = []
		# page = request.data['page']

# FOR PAGINATION - needs info on what was include in the last slice of data so re-queries don't include same data (e.g. if new topic during that time, pushing everything down an index)
		# array_limit = (page*20) + 19
		array_limit = 20
		counter = 0
		while counter < array_limit:
			for topic in django_user.topics_followed.all():
				for notification in topic.history.all():
					print(notification.action_type)
					#some code representing paginated notification if use react infinite scroller
					if notification: #not no notification
						participating_users_array = []
						for participating_user in notification.participating_users.all():
							participating_users_array.append(
								{'username' : participating_user.user.username, 'id' : participating_user.user.id, 'time' : participating_user.time}

							)
						notification_dict = {
						"action_type" : notification.action_type,
						"action_time" : notification.action_time,
						"parent_topic_id" : notification.topic_id,
						"participating_users" : participating_users_array,
						"og_poster_name" : topic.poster.username
						}

						if notification.action_type == "add_comment" or notification.action_type == "topic_upvote" or notification.action_type == "topic_downvote":
							#^ concerns topic
							notification_dict['topic_id'] = notification.topic_id
							notification_dict['og_topic_owner'] = notification.og_topic_owner.id
						elif notification.og_comment_owner.id == django_user.id:
							#^must concernt comment
							notification_dict['comment_id'] = notification.comment_id
							notification_dict['og_comment_owner'] = notification.og_comment_owner.id
						else:
							pass

						payload_list.append(notification_dict)
						counter += 1
		payload_list.sort(key= lambda dict:dict['action_time']) #can put in reverse=true if necessary.... this currently sorts in ascending order
		# return Response(data={"notif_data": payload_list[(page*20):((page*20)+19)]}, status=status.HTTP_200_OK)  #for pagination
		return Response(data={"notif_data": payload_list}, status=status.HTTP_200_OK)

class GetMoreNotifications(APIView):
	def post(self, request):
		user = UserFromToken(request)
		django_user = StudentUser.objects.get(username=user.username)
		payload_list = []
		oldest_notif_time = request.data['last_notif_time']

# FOR PAGINATION - needs info on what was include in the last slice of data so re-queries don't include same data (e.g. if new topic during that time, pushing everything down an index)
		# array_limit = (page*20) + 19
		array_limit = 20
		counter = 0
		while counter < array_limit:
			for topic in django_user.topics_followed.all():
				for notification in topic.history.all():
					#some code representing paginated notification if use react infinite scroller
					if notification: #not no notification
						if notification.action_time < oldest_notif_time:
							participating_users_array = []
							for participating_user in notification.participating_users.all():
								participating_users_array.append(
									{'username' : participating_user.user.username, 'id' : participating_user.user.id, 'time' : participating_user.time}

								)
							notification_dict = {
							"action_type" : notification.action_type,
							"action_time" : notification.action_time,
							"parent_topic_id" : notification.topic_id,
							"participating_users" : participating_users_array,
							"og_poster_name" : topic.poster.username
							}

							if notification.action_type == "add_comment" or notification.action_type == "topic_upvote" or notification.action_type == "topic_downvote":
								#^ concerns topic
								notification_dict['topic_id'] = notification.topic_id
								notification_dict['og_topic_owner'] = notification.og_topic_owner.id
							elif notification.og_comment_owner.id == django_user.id:
								#^must concernt comment
								notification_dict['comment_id'] = notification.comment_id
								notification_dict['og_comment_owner'] = notification.og_comment_owner.id
							else:
								pass

							payload_list.append(notification_dict)
							counter += 1
		payload_list.sort(key= lambda dict:dict['action_time']) #can put in reverse=true if necessary.... this currently sorts in ascending order
		# return Response(data={"notif_data": payload_list[(page*20):((page*20)+19)]}, status=status.HTTP_200_OK)  #for pagination
		return Response(data={"notif_data": payload_list}, status=status.HTTP_200_OK)





class SetUniInfo(APIView):
	def post(self, request):
		user = UserFromToken(request)
		django_user = StudentUser.objects.get(username=user.username)
		#all_units = Unit.objects.all() #change to filter based on university (email)

		request_groups_as_list = [request.data['group_list']] #fix this, make frontend safer so this parser can be safer
		print(request_groups_as_list)
		for group_code in request_groups_as_list: #add code to turn frontend created string/json into list to iterate over
			try:
				group_as_django_object = Group.objects.get(group_code=group_code) #filter by unit_code
				django_user.current_groups.add(group_as_django_object)
				print('added group_code successfully')
				print(group_code)
			except:
				print('error adding group')
				return Response(status=status.HTTP_400_BAD_REQUEST)
		django_user.faculty = request.data['faculty']
		return Response(data={"test response set_uni_info":"ok"}, status=status.HTTP_200_OK)


class LogoutAndBlacklistRefreshTokenForUserView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class PostTopic(APIView): #not being used anymore, sent over websocket
	def post(self, request):
		try:
			poster = UserFromToken(request)
			poster_as_django_obj = StudentUser.objects.get(username=poster.username)
			print(poster_as_django_obj.current_groups)
			# audience_as_django_obj = poster_as_django_obj.current_groups.objects.get(group_code=request.data['audience'])
			audience_as_django_obj = Group.objects.get(group_code=request.data['audience'])
			topic_django_object = Topic.objects.create(
				poster=poster_as_django_obj, 
				content=request.data['topic_to_be_posted'],
				created_time=request.data['created_time'], 
				audience=audience_as_django_obj,
				upvotes=0,
				downvotes=0
				)
			topic_django_object.save()
			print(topic_django_object.id)
			return Response(status=status.HTTP_201_CREATED)
		except:
			return Response(data={"error":"ensure audience is as group_code e.g UNSW (260820)"},status=status.HTTP_400_BAD_REQUEST)

