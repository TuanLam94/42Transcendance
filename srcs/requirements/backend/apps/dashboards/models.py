from django.db import models
from users.models import UserProfile
from django.utils.timezone import now
from datetime import timedelta


class Participant(models.Model):
    user = models.ForeignKey(UserProfile,
                             on_delete=models.CASCADE,
                             null=True,
                             blank=True)
    name = models.CharField(max_length=30,
                            default="unknown",
                            null=False)
    is_ai = models.BooleanField(default=False)

    @classmethod
    def get_unknown(cls):
        unknown, created = cls.objects.get_or_create(user=None,
                                                     name="Unknown",
                                                     is_ai=False)
        return unknown
    
    @classmethod
    def get_unknown_pk(cls):
        unknown = cls.get_unknown()
        return unknown.pk

    @classmethod
    def get(cls, user_id):
        try:
            user = UserProfile.objects.get(id=user_id)
            participant, created = cls.objects.get_or_create(
                user=user,
                name=user.username,
                is_ai=False
            )
        except UserProfile.DoesNotExist:
            participant = cls.get_unknown()
        return participant

    @classmethod
    def get_ai(cls):
        ai, created = cls.objects.get_or_create(user=None,
                                                name="Computer",
                                                is_ai=True)
        return ai

class Game(models.Model):
    id = models.AutoField(primary_key=True)
    player1 = models.ForeignKey(Participant,
                                default=Participant.get_unknown_pk,
                                on_delete=models.SET_DEFAULT,
                                related_name="games_as_player1")
    player2 = models.ForeignKey(Participant,
                                default=Participant.get_unknown_pk,
                                on_delete=models.SET_DEFAULT,
                                related_name="games_as_player2")
    winner = models.ForeignKey(Participant,
                               default=Participant.get_unknown_pk,
                               on_delete=models.SET_DEFAULT,
                               related_name="games_won")
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    longest_exchange = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(null=True,
                                    blank=True)
    tournament = models.ForeignKey("Tournament",
                                   null=True,
                                   blank=True,
                                   on_delete=models.SET_NULL,
                                   related_name="games")
    finished = models.BooleanField(default=False)

    @classmethod
    def create(cls, id1, id2, score_1, score_2, duration=None, longest_exchange=None):
        return cls.objects.create(player1=Participant.get(id1),
                                  player2=Participant.get(id2),
                                  winner=Participant.get(id1) if score_1 > score_2
                                  else Participant.get(id2),
                                  score_player1=score_1,
                                  score_player2=score_2,
                                  duration=duration,
                                  longest_exchange=longest_exchange)

    @classmethod
    def create_ai(cls, id_player, score_player, score_ai, duration=None, longest_exchange=None):
        return cls.objects.create(player1=Participant.get(id_player),
                                  player2=Participant.get_ai(),
                                  winner=Participant.get_ai() if score_ai > score_player
                                  else Participant.get(id_player),
                                  score_player1=score_player,
                                  score_player2=score_ai,
                                  duration=duration,
                                  longest_exchange=longest_exchange)


class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    creator = models.ForeignKey(UserProfile,
                                null=True,
                                on_delete=models.CASCADE,
                                related_name="tournaments_created")
    players = models.ManyToManyField(Participant)
    winner = models.ForeignKey(Participant,
                               null=True,
                               blank=True,
                               on_delete=models.CASCADE,
                               related_name="winner_of_tournament")
    created_at = models.DateTimeField(auto_now_add=True)
    finished = models.BooleanField(default=False)
