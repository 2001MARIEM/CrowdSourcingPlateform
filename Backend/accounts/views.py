from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from django.shortcuts import get_object_or_404
from .utils.email_utils import send_password_reset_email,send_welcome_email_chercheur 
from datetime import datetime
import re
import random
import string


#creation mta utilisateur adi

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'Inscription réussie'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#creation mta admin 


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff
    
class CreateAdminUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request):
        data = request.data.copy()
        data["is_staff"] = True
        data["is_superuser"] = True

        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Administrateur créé avec succès"}, status=201)
        return Response(serializer.errors, status=400)    
        
    
    

class LoginView(APIView):
    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                refresh = RefreshToken.for_user(user)
                user_role = 'admin' if user.is_staff and user.is_superuser else 'evaluator'
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'userRole': user_role,
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error during login: {e}")
            return Response({"error": "Something went wrong"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

#mot de passe oublier


class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email', '').lower()
        user = CustomUser.objects(email=email).first()

        if not user:
            return Response({"detail": "Utilisateur non trouvé."}, status=404)

        send_password_reset_email(user)
        return Response({"message": "E-mail de réinitialisation envoyé."}, status=200)


class ResetPasswordView(APIView):
    def post(self, request, token):
        password = request.data.get('password')
        user = CustomUser.objects(reset_token=token).first()

        if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
            return Response({"detail": "Lien invalide ou expiré."}, status=400)

        # Validation du mot de passe
        errors = []
        if len(password) < 6:
            errors.append("6 caractères minimum")
        if not re.search(r'[A-Z]', password):
            errors.append("1 majuscule")
        if not re.search(r'[a-z]', password):
            errors.append("1 minuscule")
        if not re.search(r'\d', password):
            errors.append("1 chiffre")
        if not re.search(r'[@$!%*?&#]', password):
            errors.append("1 caractère spécial")

        if errors:
            return Response(
                {"password": f"Mot de passe invalide : {', '.join(errors)}."},
                status=400
            )

        user.set_password(password)
        user.reset_token = None
        user.reset_token_expiry = None
        user.save()

        return Response({"message": "Mot de passe mis à jour avec succès."}, status=200)



# Permission personnalisée pour les évaluateurs
# class IsEvaluator(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return request.user and request.user.is_authenticated and not request.user.is_staff

class IsAuthenticatedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

# Modifier la UserProfileView
class UserProfileView(APIView):
    permission_classes = [IsAuthenticatedUser]  # Nouvelle permission

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            partial=True,
            context={'request': request}  # Ajouter le contexte si nécessaire
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



    

# Permission personnalisée pour les admins
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class EvaluatorListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = CustomUser.objects(is_staff=False, is_superuser=False)
        data = UserProfileSerializer(users, many=True).data
        return Response(data)

class DeactivateUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, user_id):
        user = CustomUser.objects(id=user_id).first()
        if not user:
            return Response({"message": "Utilisateur introuvable"}, status=404)
        user.is_active = False
        user.save()
        return Response({"message": "Utilisateur désactivé"})

class ReactivateUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, user_id):
        user = CustomUser.objects(id=user_id).first()
        if not user:
            return Response({"message": "Utilisateur introuvable"}, status=404)
        user.is_active = True
        user.save()
        return Response({"message": "Utilisateur réactivé"})
    


def generate_secure_password(length=10):
    specials = "@$!%*?&#"
    password_chars = string.ascii_letters + string.digits + specials

    # Garantir au moins un caractère de chaque type requis
    password = [
        random.choice(string.ascii_lowercase),
        random.choice(string.ascii_uppercase),
        random.choice(string.digits),
        random.choice(specials),
    ]
    password += random.choices(password_chars, k=length - len(password))
    random.shuffle(password)
    return ''.join(password)    
    
class CreateChercheurUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request):
        data = request.data.copy()
        password = generate_secure_password()
        data["password"] = password
        data["is_staff"] = False
        data["is_superuser"] = False
        data["is_chercheur"] = True

        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            send_welcome_email_chercheur(user, password)
            return Response({"message": "Compte chercheur créé avec succès et email envoyé."}, status=201)
        return Response(serializer.errors, status=400)
    



