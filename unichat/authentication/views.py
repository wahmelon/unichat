from django.shortcuts import render
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import MyTokenObtainPairSerializer, StudentUserSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import StudentUser, Unit

def UserFromToken(request):
	jwt_object = JWTAuthentication()
	header = jwt_object.get_header(request)
	raw_token = jwt_object.get_raw_token(header)
	validated_token = jwt_object.get_validated_token(raw_token)
	return jwt_object.get_user(validated_token)	


class ObtainTokenPairWithCurrentUnitsView(TokenObtainPairView):
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
		return Response(data={"username":user.username}, status=status.HTTP_200_OK)

class SetUniInfo(APIView):
	def post(self, request):
		user = UserFromToken(request)
		django_user = StudentUser.objects.get(username=user.username)
		#all_units = Unit.objects.all() #change to filter based on university (email)

		request_unit_as_list = [request.data['unit_list']] #fix this, make frontend safer so this parser can be safer
		for unit_code in request_unit_as_list: #add code to turn frontend created string/json into list to iterate over
			try:
				unit_as_django_object = Unit.objects.get(unit_code=unit_code) #filter by unit_code
				django_user.current_units.add(unit_as_django_object)
				print('added unit successfully')
			except:
				print('error adding unit')
		print(request.data['faculty'])
		django_user.faculty = request.data['faculty']
		print('test')
		print(django_user.faculty)
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