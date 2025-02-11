from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserProfileManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError("Username is required")
        if not password:
            raise ValueError("Password mandatory")
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(username, email, password, **extra_fields)

class UserProfile(AbstractBaseUser, PermissionsMixin):
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "password"]

    id =                    models.AutoField(primary_key=True)
    username =              models.CharField(max_length=30, unique=True)
    email =                 models.EmailField(unique=True)
    avatar_url =            models.URLField(blank=True, null=True)
    created_at =            models.DateTimeField(auto_now_add=True)
    is_active =             models.BooleanField(default=True)
    is_mail_activated =     models.BooleanField(default=False)
    is_staff =              models.BooleanField(default=False)
    is_two_factor_active =  models.BooleanField(default=True)
    is_two_factor_mail =    models.BooleanField(default=True)
    is_two_factor_auth =    models.BooleanField(default=False)
    two_factor_code =       models.CharField(max_length=6, blank=True, null=True)
    two_factor_expiry =     models.DateTimeField(blank=True, null=True, default=None)
    totp_secret =           models.CharField(max_length=32, blank=True, null=True)
    
    objects = UserProfileManager()
    theme = models.CharField(
        max_length=5,
        choices=[("light", "Light"), ("dark", "Dark")],
        default="light",
    )

    def is_2fa_valid(self, code):
        return (self.two_factor_code == code 
            and self.two_factor_expiry
            and self.two_factor_expiry > timezone.now())
        
    def send_2fa(user):
        self.two_factor_code = get_random_string(length=6,
                                                allowed_chars=string.digits)
        self.two_factor_expiry = timezone.now() + timedelta(minutes=15)
        self.save()

        send_mail(
            'Your 2FA Code',
            f'Your 2FA code is: {user.two_factor_code}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

    def __str__(self):
        return self.username

