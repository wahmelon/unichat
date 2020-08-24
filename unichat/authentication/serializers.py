from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import StudentUser, Unit
import re

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)

        # Add custom claims
        token['username'] = user.username
        return token
# EXPERIMENTAL CODE FOR PARSING UNIT_LIST
#class UserFilteredPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    #def get_queryset(self):
        #request = self.context.get('request', None)
        #queryset = super(UserFilteredPrimaryKeyRelatedField, self).get_queryset()
        #if not request or not queryset:
            #return None
        #unit_array = request.unit_list #split array on commas
        #for item in unit list, if item in unit_list,
        #return queryset.filter(unit_code=request.user) #CHANGE TO REQUEST.UNIT CODE - need to loop thru array?

#class UnitSerializer(serializers.ModelSerializer):
	#units = serializers.UserFilteredPrimaryKeyRelatedField(queryset=Unit.objects.all(), many=True)

	#class Meta:
		#model = Unit
		#fields = ('id','unit_code')

class StudentUserSerializer(serializers.ModelSerializer):
	email = serializers.EmailField(
	required=True
	)
	username = serializers.CharField()
	password = serializers.CharField(min_length=8, write_only=True)
	faculty = serializers.CharField()

	class Meta:
		model = StudentUser
		fields = ('email', 'username', 'password', 'faculty')
		extra_kwargs = {'password': {'write_only': True}}

	def create(self, validated_data): #validated_data is parsed into a valid python dictionary
		password = validated_data.pop('password', None)
		instance = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
		if password is not None:
			instance.set_password(password)
		email = validated_data.pop('email', None)
		email_format_dict = {'unsw.edu.au':'UNSW', 'uni.sydney.edu.au':'USYD', 'anu.edu.au':'ANU', 'student.unimelb.edu.au':'UNIMELB'}
		for key in email_format_dict:
			if key in email:
				instance.university = email_format_dict[key]
		print('success!')
		instance.faculty = validated_data.pop('faculty',None)
		instance.save()
		return instance


