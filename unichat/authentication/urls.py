from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from .views import ObtainTokenPairWithCurrentUnitsView, StudentUserCreate, GetUserGroups, LogoutAndBlacklistRefreshTokenForUserView


urlpatterns = [
	path('user/create/', StudentUserCreate.as_view(), name = 'create_user'),
    path('token/obtain/', ObtainTokenPairWithCurrentUnitsView.as_view(), name='token_create'),  # override sjwt stock token
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('getusergroups/', GetUserGroups.as_view(), name='get_user_groups'),
    path('blacklist/', LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='blacklist')
]