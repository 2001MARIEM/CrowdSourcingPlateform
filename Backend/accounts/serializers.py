from rest_framework import serializers
from .models import CustomUser
from mongoengine.errors import NotUniqueError
from .utils.email_utils import send_welcome_email
import re

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    prenom = serializers.CharField(max_length=50)
    nom = serializers.CharField(max_length=50)
    age = serializers.IntegerField(required=False, min_value=0)
    secteur_activite = serializers.CharField(max_length=100, required=False)
    is_staff = serializers.BooleanField(default=False)
    is_superuser = serializers.BooleanField(default=False)
    is_chercheur = serializers.BooleanField(default=False)

    def validate_password(self, value):
        """
        Validation avancée du mot de passe avec message d'erreur unifié
        """
        errors = []
        special_chars = r'[@$!%*?&#./]'

        if len(value) < 6:
            errors.append("6 caractères minimum")
        if not re.search(r'[A-Z]', value):
            errors.append("1 lettre majuscule")
        if not re.search(r'[a-z]', value):
            errors.append("1 lettre minuscule")
        if not re.search(r'\d', value):
            errors.append("1 chiffre")
        if not re.search(special_chars, value):
            errors.append(f"1 caractère spécial parmi {special_chars[1:-1]}")

        if errors:
            raise serializers.ValidationError(
                f"Le mot de passe doit contenir : {', '.join(errors)}."
            " Exemple valide : Example1@"
            )

        return value

    def validate_email(self, value):
        """
        Vérification de l'unicité de l'email avec requête optimisée
        """
        if CustomUser.objects(email=value).first():
            raise serializers.ValidationError(
                "Cet email est déjà associé à un compte."
                " Utilisez la fonction 'Mot de passe oublié' si nécessaire."
            )
        return value.lower()  # Normalisation de l'email

    def create(self, validated_data):
        """
        Création d'utilisateur avec gestion d'erreur et hachage sécurisé
        """
        try:
            user = CustomUser(**validated_data)
            user.set_password(validated_data['password'])  # Supposons que set_password utilise bcrypt
            user.save()
            
            send_welcome_email(user) #envoi d'email de bienvenu automatique  
            return user
        except NotUniqueError:
            raise serializers.ValidationError({"email": "Cet email existe déjà."})
        except Exception as e:
            raise serializers.ValidationError(str(e))

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        """
        Authentification avec messages d'erreur génériques pour la sécurité
        """
        email = attrs.get('email', '').lower()
        password = attrs.get('password', '')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError(
                {"non_field_errors": "Identifiants invalides"}
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                {"non_field_errors": "Identifiants invalides"}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {"non_field_errors": "Ce compte est désactivé. Contactez le support."}
            )

        attrs['user'] = user
        return attrs

class UserProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    prenom = serializers.CharField(max_length=50)
    nom = serializers.CharField(max_length=50)
    age = serializers.IntegerField(required=False, min_value=0)
    secteur_activite = serializers.CharField(max_length=100, required=False)
    date_joined = serializers.DateTimeField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)  # Ajout utile pour le frontend

    def update(self, instance, validated_data):
        """
        Mise à jour sécurisée avec exclusion des champs sensibles
        """
        forbidden_fields = {'email', 'is_staff', 'is_superuser'}
        for field in forbidden_fields:
            validated_data.pop(field, None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        try:
            instance.save()
        except Exception as e:
            raise serializers.ValidationError(str(e))
            
        return instance