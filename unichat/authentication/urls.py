from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from .views import ObtainTokenPairWithCurrentGroupsView, StudentUserCreate, GetUserGroups, LogoutAndBlacklistRefreshTokenForUserView, SetUniInfo, PostTopic


urlpatterns = [
	path('user/create/', StudentUserCreate.as_view(), name = 'create_user'),
	path('user/set_uni_info/', SetUniInfo.as_view(), name = 'set_uni_info'),
	path('user/post_topic/', PostTopic.as_view(), name='post_topic'),
    path('token/obtain/', ObtainTokenPairWithCurrentGroupsView.as_view(), name='token_create'),  # override sjwt stock token
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('getusergroups/', GetUserGroups.as_view(), name='get_user_groups'),
    path('blacklist/', LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='blacklist')
]