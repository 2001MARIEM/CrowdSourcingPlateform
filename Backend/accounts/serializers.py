from rest_framework import serializers
from .models import CustomUser
from mongoengine.errors import NotUniqueError
import bcrypt

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    prenom = serializers.CharField(max_length=50)
    nom = serializers.CharField(max_length=50)
    age = serializers.IntegerField(required=False)
    secteur_activite = serializers.CharField(max_length=100, required=False)
    is_staff = serializers.BooleanField(default=False)
    is_superuser = serializers.BooleanField(default=False)

    def create(self, validated_data):
        try:
            raw_password = validated_data.pop("password")
            
            user = CustomUser(**validated_data)
           
            user.set_password(raw_password)  # 🔐 Hash password avec bcrypt
            user.save()
            return user
        except NotUniqueError:
            raise serializers.ValidationError({"email": "Cet email existe déjà."})

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data['email']
        password = data['password']
        try:
            user = CustomUser.objects.get(email=email)
            if not user.check_password(password):  # ✅ Vérification sécurisée
                raise serializers.ValidationError("Mot de passe incorrect.")
            if not user.is_active:
                raise serializers.ValidationError("Compte désactivé.")
            return user
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Email non trouvé.")

class UserProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    prenom = serializers.CharField(max_length=50)
    nom = serializers.CharField(max_length=50)
    age = serializers.IntegerField(required=False)
    secteur_activite = serializers.CharField(max_length=100, required=False)
    date_joined = serializers.DateTimeField(read_only=True)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
