from datetime import timedelta
from users.models import UserProfile
from .models import Game  # Assure-toi que les modèles sont corrects
from django.db.models import Count
from django.utils import timezone


# Fonction principale pour obtenir les statistiques
def get_user_stats(user):
    user_data = {
        "user": user.username,
        "avatar_url": user.avatar_url,
        "wins": 0,
        "losses": 0,
        "winrate": 0,
        "winstreak": 0,
        "total_time_played": "0:00",
        "solo_games": 0,
        "online_games": 0,
        "unique_opponents_count": 0,
        "daily_results": [],
        "games": []
    }

    games = (Game.objects.filter(player1=user, winner__isnull=False) | 
             Game.objects.filter(player2=user, winner__isnull=False))  #todo @leontinepaq check ok de garder que parties avec gagnant

    user_data["wins"], user_data["losses"], user_data["winrate"] = get_win_loss_count(games)
    user_data["winstreak"] = calculate_win_streak(games)
    user_data["total_time_played"] = calculate_total_time_played(games)
    user_data["solo_games"], user_data["online_games"] = count_game_types(games)
    user_data["unique_opponents_count"] = count_unique_opponents(games)
    user_data["daily_results"] = get_daily_results(games)
    user_data["games"] = get_game_history(games)

    return user_data


def get_win_loss_count(games, user):
    total_games_played = games.count()
    wins = games.filter(winner=user.id).count()
    losses = total_games_played - wins
    win_rate = (wins / total_games_played) * 100 if total_games_played > 0 else 0
    return wins, losses, win_rate


def calculate_win_streak(games, user):
    streak_games = games.order_by("-created_at")
    win_streak = 0
    for game in streak_games:
        if game.winner == user.id:
            win_streak += 1
        else:
            break
    return win_streak


def calculate_total_time_played(games):
    total_time_played = timedelta()
    for game in games:
        total_time_played += game.duration  # Assure-toi que game.duration est un timedelta
    return str(total_time_played)

# Compter les jeux en solo et en ligne
def count_game_types(games):
    solo_games = games.filter(is_solo=True).count()  # Vérifie que "is_solo" est un champ du modèle Game
    online_games = games.filter(is_solo=False).count()  # Même pour ce champ
    return solo_games, online_games

# Compter les adversaires uniques
def count_unique_opponents(games):
    player1_opponents = games.exclude(player1=games.first().player1).values("player1").distinct()
    player2_opponents = games.exclude(player2=games.first().player2).values("player2").distinct()
    return player1_opponents.count() + player2_opponents.count()

# Récupérer les résultats quotidiens
def get_daily_results(games):
    today = timezone.now().date()
    daily_results = Game.objects.filter(created_at__date=today, player1=games.first().player1) | \
                    Game.objects.filter(created_at__date=today, player2=games.first().player2)

    daily_stats = []
    for result in daily_results:
        daily_stats.append({
            "created_at": result.created_at.isoformat(),
            "wins": 1 if result.winner == games.first().player1 else 0,
            "losses": 1 if result.winner != games.first().player1 else 0
        })
    return daily_stats

# Récupérer l'historique des jeux
def get_game_history(games):
    game_list = []
    for game in games:
        game_data = {
            "id": game.id,
            "player1": {
                "is_ai": game.player1.is_ai,
                "id": game.player1.id,
                "username": game.player1.username,
                "avatar_url": game.player1.avatar_url
            },
            "player2": {
                "is_ai": game.player2.is_ai,
                "id": game.player2.id,
                "username": game.player2.username,
                "avatar_url": game.player2.avatar_url
            },
            "winner": game.winner.id if game.winner else None,
            "score_player1": game.score_player1,
            "score_player2": game.score_player2,
            "longest_exchange": game.longest_exchange,
            "created_at": game.created_at.isoformat(),
            "duration": str(game.duration),
            "tournament": game.tournament.id if game.tournament else None
        }
        game_list.append(game_data)
    return game_list

def get_user_stats(user_profile):
    # participant = get_object_or_404(Participant, user=user_profile)
    try:
        participant = Participant.objects.get(user=user_profile)
    except Participant.DoesNotExist:
        participant = None

    if not participant:
        return {
        "user": user_profile.username,
        "total_games_played": 0,
        "wins": 0,
        "losses": 0,
        "winrate": 0.0,
        "winstreak": 0,
        "total_time_played": timedelta(seconds=0),
        "solo_games": 0,
        "multiplayer_games": 0,
        "online_games": 0,
        "unique_opponents_count": 0,
        "games": [],
        "tournaments": [],
    }

    games = Game.objects.filter(Q(player1=participant) | Q(player2=participant))
    total_games_played = games.count()
    wins = games.filter(winner=participant).count()
    losses = total_games_played - wins
    winrate = (wins / total_games_played) * 100 if total_games_played > 0 else 0
    total_time_played = sum((game.duration for game in games if game.duration is not None), timedelta())

    solo_games = 0
    multiplayer_games = 0
    online_games = 0
    for game in games:
        if game.player2.is_ai:
            solo_games += 1
        elif game.player2.user is None:
            multiplayer_games += 1
        else:
            online_games += 1

    winstreak = 0
    for game in reversed(games):
        if game.winner and game.winner.user == user_profile:
            winstreak += 1
        else:
            break

    unique_opponents = set()
    for game in games:
        opponent = game.player2 if game.player1.user == user_profile else game.player1
        if opponent.user != None:
            unique_opponents.add(opponent.user)
    unique_opponents_count = len(unique_opponents)

    tournaments = Tournament.objects.filter(players=participant)
    return {
        "user": user_profile.username,
        "total_games_played": total_games_played,
        "wins": wins,
        "losses": losses,
        "winrate": round(winrate, 2),
        "winstreak": winstreak,
        "total_time_played": total_time_played,
        "solo_games": solo_games,
        "multiplayer_games": multiplayer_games,
        "online_games": online_games,
        "unique_opponents_count": unique_opponents_count,
        "games": games,
        "tournaments": tournaments,
    }