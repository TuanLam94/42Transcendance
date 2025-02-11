from django.urls import path
from .views import register, login, verify_2fa, logout, auth_check, send_2fa, verify_authenticator, activate_authenticator

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("logout/", logout),
    path("send_2fa/", send_2fa),
    path("verify_2fa/", verify_2fa),
    path("auth_check/", auth_check),
    path('activate_authenticator/', activate_authenticator, name='activate_authenticator'),
    path('authenticator/', verify_authenticator, name='authenticator'),
]

#remove names