from django.shortcuts import render
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import MyTokenObtainPairSerializer, StudentUserSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import StudentUser, Group
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
		for group in django_user.current_groups.all():
			group_code_and_topic_ids = {}
			group_code_and_topic_ids['group_code']  = group.group_code

			topic_id_list = []
			for topic in group.topics.all():
				if topic:
					topic_id_list.append(topic.id)

			group_code_and_topic_ids['ids'] = topic_id_list

			payload_list.append(group_code_and_topic_ids)
		print(payload_list)
					# topic_comment_list.append(topic.as_dict())
			#topics has been set as related_name on foreign key params in Topic object referencing Group object #allowing this lookup
		# print(topic_comment_list)
		return Response(data={"user_id" : django_user.id, "GroupCodesAndIds": payload_list, "topic_id_list":topic_id_list,"username":user.username,'faculty':user.faculty, 'university':user.university}, status=status.HTTP_200_OK)

class GetTopicData(APIView):
	def post (self, request):
		topic_id = request.data['topic_id']
		topic_django_object = Topic.objects.get(id=topic_id)
		return Response(data={"topic_data":topic_django_object.as_dict()}, status=status.HTTP_200_OK)


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

class PostTopic(APIView):
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
