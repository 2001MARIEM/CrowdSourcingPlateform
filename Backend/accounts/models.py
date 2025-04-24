from mongoengine import Document, StringField, EmailField, BooleanField, IntField, DateTimeField
from django.utils import timezone
import bcrypt 

class CustomUser(Document):
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    prenom = StringField(max_length=50, default="")
    nom = StringField(max_length=50, default="")
    age = IntField(null=True)
    secteur_activite = StringField(max_length=100, null=True)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    is_superuser = BooleanField(default=False)
    date_joined = DateTimeField(default=timezone.now)

    meta = {'collection': 'custom_users'}

    def __str__(self):
        return self.email
    
    def is_authenticated(self):
        return True
    

    def set_password(self, raw_password):
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
        self.password = hashed.decode('utf-8')

    def check_password(self, raw_password):
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))
    
    
