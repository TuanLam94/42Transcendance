from django.shortcuts import render, get_object_or_404
from datetime import timedelta
from django.db.models import Q
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from users.models import UserProfile
from .models import Game, Tournament, Participant
from .serializers import (GameSerializer, TournamentSerializer, 
    UserStatisticsSerializer, ParticipantSerializer, RequestCreateGameSerializer, RequestCreateTournamentSerializer)
from users.serializers import GenericResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes


#Display user stats by ID
@extend_schema(
    summary="Fetch user's stats identified by ID.",
    description="Fetch all user's gaming stats. User is \
        identified by ID. If no ID provided, returns current user's stats",
    responses={404: GenericResponse,
               200: UserStatisticsSerializer},
    parameters=[OpenApiParameter(name="user_id",
                                 type=OpenApiTypes.INT,
                                 location=OpenApiParameter.QUERY)],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_user_stats(request):
    user_id = request.query_params.get("user_id")
    if not user_id:
        user_profile = request.user
    else:
        try:
            user_profile = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            user_profile = None
    
    if not user_profile:
        return Response({"details": "User not found"}, status=404)

    stats = get_user_stats(user_profile)
    if stats is None:
        return Response({"details": "User not found"}, status=404)

    return Response(UserStatisticsSerializer(stats).data, status=200)




# EX DISPLAY PROFILES /OTHER PROFILE
# @leontinepaq a supprimer

# @extend_schema(summary="display user's own profile",
#                description="fetches user's own profile and returns its data",
#                responses={200: UserProfileSerializer})
# @permission_classes([IsAuthenticated])
# @api_view(["GET"])
# def profile(request):
#     serializer = UserProfileSerializer(request.user)
#     return Response(serializer.data, status=200)

# @extend_schema(summary="display another user's profile",
#                description="fetches another user's profile based on \
#                    provided user_id and returns its data",
#                parameters=[OpenApiParameter(name="user_id",
#                                             type=int,
#                                             location=OpenApiParameter.QUERY,
#                                             required=True)],
#                responses={404: UserNotFoundErrorSerializer,
#                           200: UserPublicProfileSerializer}
#                )
# @permission_classes([IsAuthenticated])
# @api_view(["GET"])
# def other_profile(request):
#     user_id = request.query_params.get("user_id")

#     if not user_id or not user_id.isdigit():
#         return Response({"details": "Invalid user_id"}, status=400)
#     if not UserProfile.objects.filter(id=user_id).exists():
#         return UserNotFoundErrorSerializer().response(404)
#     user = get_object_or_404(UserProfile, id=int(user_id))
#     serializer = UserPublicProfileSerializer(user)
#     return Response(serializer.data, status=200)