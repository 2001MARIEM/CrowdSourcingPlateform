from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from .models import CustomUser
from bson import ObjectId


class MongoJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")

        try:
            # ⚠️ On récupère l'utilisateur via MongoEngine, pas Django ORM
            if not ObjectId.is_valid(user_id):
                raise exceptions.AuthenticationFailed("ID utilisateur invalide.")
            user = CustomUser.objects.get(id=ObjectId(user_id))
        except CustomUser.DoesNotExist:
            raise exceptions.AuthenticationFailed("Utilisateur non trouvé.")

        if not user.is_active:
            raise exceptions.AuthenticationFailed("Utilisateur désactivé.")

        return user
