from mailjet_rest import Client
import os
from django.conf import settings
from datetime import datetime, timedelta
from django.core.mail import send_mail
import uuid
from django.core.mail import send_mail

MAILJET_API_KEY = 'cd9e324103d021788094f7ea1c644ea6'
MAILJET_API_SECRET = '8236bbf28c4b2cd2d2035c1ae7892082'

mailjet = Client(auth=(MAILJET_API_KEY, MAILJET_API_SECRET), version='v3.1')

#welcome mail l'evaluateur adi

def send_welcome_email(user):
    data = {
        'Messages': [
            {
                "From": {
                    "Email": "chaimafilali10@gmail.com",  # Ton expéditeur validé chez Mailjet
                    "Name": "CrowdSourcingPlatform"
                },
                "To": [
                    {
                        "Email": user.email,
                        "Name": user.prenom
                    }
                ],
                "Subject": f"Bienvenue sur CrowdSourcingPlatform, {user.prenom}",
                "TextPart": f"Bonjour {user.prenom}, bienvenue sur notre plateforme !",
                "HTMLPart": f"""
                    <h3>Bonjour {user.prenom},</h3>
                    <p>Bienvenue sur <strong>CrowdSourcingPlatform</strong> !</p>
                    <p>Votre compte est maintenant actif. Profitez des fonctionnalités disponibles.</p>
                    <br/>
                    <p>L'équipe CrowdSourcingPlatform</p>
                """
            }
        ]
    }
    result = mailjet.send.create(data=data)
    return result.status_code, result.json()

#welcome mail lcompte chercheur (fih lmail wl mdp mteou)

def send_welcome_email_chercheur(user, raw_password):
    data = {
        'Messages': [
            {
                "From": {
                    "Email": "chaimafilali10@gmail.com",
                    "Name": "CrowdSourcingPlatform"
                },
                "To": [
                    {
                        "Email": user.email,
                        "Name": user.prenom
                    }
                ],
                "Subject": f"Bienvenue {user.prenom}, vous êtes maintenant Chercheur !",
                "TextPart": f"Bonjour {user.prenom}, votre compte chercheur est actif.",
                "HTMLPart": f"""
                    <h3>Bonjour {user.prenom},</h3>
                    <p>Bienvenue sur la plateforme <strong>CrowdSourcingPlatform</strong> en tant que <strong>Chercheur</strong> !</p>
                    <p>Voici vos informations de connexion :</p>
                    <ul>
                        <li><strong>Email :</strong> {user.email}</li>
                        <li><strong>Mot de passe :</strong> {raw_password}</li>
                    </ul>
                    <p>Vous pouvez maintenant vous connecter et accéder aux évaluations.</p>
                    <br/>
                    <p>Bonne exploration,<br/>L'équipe CrowdSourcingPlatform</p>
                """
            }
        ]
    }
    result = mailjet.send.create(data=data)
    return result.status_code, result.json()





#mot de passe oublié
def generate_password_reset_token(user):
    token = str(uuid.uuid4())
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    user.save()
    return token

def send_password_reset_email(user):
    token = generate_password_reset_token(user)
    reset_url = f"http://localhost:3000/auth/reset-password/{user.reset_token}"  # ← Frontend React !

    subject = "Réinitialisation de mot de passe - CrowdSourcingPlatform"
    message = (
        f"Bonjour {user.prenom},\n\n"
        f"Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :\n"
        f"{reset_url}\n\n"
        f"Ce lien expirera dans 1 heure."
    )
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False
    )
