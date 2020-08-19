from django.shortcuts import render
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import MyTokenObtainPairSerializer, StudentUserSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import StudentUser

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
		jwt_object = JWTAuthentication()
		header = jwt_object.get_header(request)
		raw_token = jwt_object.get_raw_token(header)
		validated_token = jwt_object.get_validated_token(raw_token)
		user = jwt_object.get_user(validated_token)
		django_user = StudentUser.objects.get(username=user)
		username = django_user.username
		print(django_user.id)
		return Response(data={"username":username}, status=status.HTTP_200_OK)


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