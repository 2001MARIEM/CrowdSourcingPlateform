from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from django.shortcuts import get_object_or_404

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
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)  # JWT ne vérifie pas automatiquement MongoEngine user
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



# Permission personnalisée pour les évaluateurs
class IsEvaluator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and not request.user.is_staff

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsEvaluator]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response(UserProfileSerializer(updated_user).data)
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
