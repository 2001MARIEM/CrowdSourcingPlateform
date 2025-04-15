from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


#Classe qui gère la création des utilisateurs et admin.

class CustomUserManager(BaseUserManager):
    #creation d'un utilisateur
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user
    #creation d'un admin
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields.get('is_staff'):
          raise ValueError("Le superuser doit avoir is_staff=True.")
        if not extra_fields.get('is_superuser'):
          raise ValueError("Le superuser doit avoir is_superuser=True.")
        
        return self.create_user(email, password, **extra_fields)
    




class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = None
    email = models.EmailField(unique=True)
    prenom = models.CharField(max_length=50,default="")  
    nom = models.CharField(max_length=50,default="")   
    age = models.PositiveIntegerField(null=True, blank=True)
    secteur_activite = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True) # si false l'utilisateur ne peut pas ce connecter (archivé)
    is_staff = models.BooleanField(default=False)  # Si True, accès à l'interface d'administration
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['prenom','nom','age','secteur_activite'] #les champs li nhebhom ykounou obligatoire

    def __str__(self):
        return self.email
