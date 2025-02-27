from rest_framework import serializers
from .models import UserProfile
from rest_framework import status
from rest_framework.response import Response

# USERS


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id',
                  'username',
                  'email',
                  'avatar_url',
                  'theme',
                  'is_active',
                  'is_connected',
                  'created_at',
                  'password',
                  'is_two_factor_mail',
                  'is_two_factor_auth']
        read_only_fields = ['created_at',
                            'updated_at',
                            'id']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        user = UserProfile.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user


class UserPublicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['username',
                  'avatar_url',
                  'id',
                  'is_connected']

    def create(self, validated_data):
        user = UserProfile.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user

# GENERICS


class GenericResponseSerializer(serializers.Serializer):
    details = serializers.CharField(default="details")

    def response(self, _status=200):
        return Response(self.data,
                        status=_status)


class RequestUsernameSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)


class UserNotFoundErrorSerializer(GenericResponseSerializer):
    details = serializers.CharField(default="User does not exist")

# PRE-LOGIN


class ResponsePreLogin(GenericResponseSerializer):
    details = None
    two_factor_mail = serializers.BooleanField(default=False)
    two_factor_auth = serializers.BooleanField(default=False)

# LOGIN


class RequestLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True,
                                     write_only=True)
    two_factor_code = serializers.CharField(default="123456")


class ResponseLoginError(GenericResponseSerializer):
    details = serializers.CharField(default="Wrong code/Wrong password")


class ResponseLoginSuccess(GenericResponseSerializer):
    details = serializers.CharField(default="Login successful")

# LOGOUT


class ResponseLogout(serializers.Serializer):
    details = serializers.CharField(default="Logout successful")
# REGISTER


class RequestRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True,
                                     write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)
    email = serializers.EmailField(required=True)


class ResponseRegisterErrorSerializer(GenericResponseSerializer):
    details = serializers.CharField(default="Username or email already exists")
    username = serializers.BooleanField(default=False)
    email = serializers.BooleanField(default=False)

# VERIFY 2FA MAIL/QR


class RequestVerify2faSerializer(serializers.Serializer):
    code = serializers.CharField(default=123456)

# GET 2FA QR


class ResponseGet2faQR(serializers.Serializer):
    qr_code = serializers.CharField(help_text="Base64-encoded QR code image")

# REFRESH TOKEN


class ResponseRefreshToken(serializers.Serializer):
    details = serializers.CharField(default="Token refreshed successfully")


class ResponseRefreshTokenErrorMissing(serializers.Serializer):
    details = serializers.CharField(default="No refresh token provided")


class ResponseRefreshTokenErrorInvalid(serializers.Serializer):
    details = serializers.CharField(default="Invalid or expired refresh token")
