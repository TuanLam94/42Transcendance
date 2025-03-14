from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserProfile


class CustomUserAdmin(UserAdmin):
    model = UserProfile
    list_display = ("id", "username", "email", "is_active", "is_staff",
                    "is_superuser", "is_two_factor_mail", "is_two_factor_auth",
                    "theme")
    list_filter = ("is_staff", "is_active", "is_superuser")
    search_fields = ("username", "email")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("email", "avatar_url")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Security", {"fields": ("is_two_factor_mail",
         "two_factor_code", "two_factor_expiry", "is_two_factor_auth")}),
        ("Preferences", {"fields": ("theme",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username",
                       "email",
                       "password1",
                       "password2",
                       "is_active",
                       "is_staff",
                       "is_superuser"),
        }),
    )


admin.site.register(UserProfile, CustomUserAdmin)
