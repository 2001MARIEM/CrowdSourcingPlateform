from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate

# inscription user/admin

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    is_staff = serializers.BooleanField(default=False)
    is_superuser = serializers.BooleanField(default=False)

    class Meta:
        model = CustomUser
        fields = [
            'email',
            'password',
            'prenom',
            'nom',
            'age',
            'secteur_activite',
            'is_staff',
            'is_superuser'
        ]

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)
    
# se connecter pour user/admin    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Identifiants incorrects")
    

    
#consulter et modifier les infos par les evaluateurs

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'email',
            'prenom',
            'nom',
            'age',
            'secteur_activite',
            'date_joined',
        ]
        read_only_fields = ['email', 'date_joined']  # Ces champs ne peuvent pas être modifiés
