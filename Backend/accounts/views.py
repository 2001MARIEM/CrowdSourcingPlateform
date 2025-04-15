from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer,UserProfileSerializer
from .models import CustomUser
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404

User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'Inscription réussie'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# consulter les infos personnelles par l'evaluateur et les modifiers si necessaire


#permission:uniquement pour les evaluateur 
class IsEvaluator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and not request.user.is_staff
    
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated,IsEvaluator]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 
    


    



# Permission custom : uniquement pour les admins
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

#  Liste des évaluateurs
class EvaluatorListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        # Récupère tous les users et filtre en Python pur (évite Djongo SQL)
        return [user for user in CustomUser.objects.all() if not user.is_staff and not user.is_superuser]


#  Désactiver un utilisateur
class DeactivateUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        user.is_active = False
        user.save()
        return Response({"message": "Utilisateur désactivé avec succès"})

# Réactiver un utilisateur
class ReactivateUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        user.is_active = True
        user.save()
        return Response({"message": "Utilisateur réactivé avec succès"})
    


