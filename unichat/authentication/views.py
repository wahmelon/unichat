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

class GetUserGroups(APIView):
	def get(self, request):
		user = UserFromToken(request)
		django_user = StudentUser.objects.get(username=user.username)

		user_current_groups = django_user.current_groups.all()[:20]
		for group in user_current_groups:
			topics_of_group = group.topics.all() #change this to limit to specific number
			#topics has been set as related_name on foreign key params in Topic object referencing Group object #allowing this lookup
			for topic in topics_of_group:
				print(topic.as_dict())

			
		return Response(data={"username":user.username, "university": user.university}, status=status.HTTP_200_OK)

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
		print(request.data['faculty'])
		django_user.faculty = request.data['faculty']
		print('test')
		print(django_user.faculty)
		print(django_user.current_groups.all())
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
