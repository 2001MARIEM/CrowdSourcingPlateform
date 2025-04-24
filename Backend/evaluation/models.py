# evaluation/models.py

from mongoengine import Document, StringField, IntField, BooleanField, URLField, DictField, DateTimeField, ReferenceField
from django.utils import timezone
from accounts.models import CustomUser 


class Media(Document):
    MEDIA_TYPE_CHOICES = ('image', 'video')

    year = IntField(required=True)
    square_index = IntField(required=True)
    place = StringField(max_length=255)
    description = StringField()
    media_type = StringField(choices=MEDIA_TYPE_CHOICES, required=True)
    url = URLField(required=True)
    caption = StringField()
    coords = DictField(null=True)
    deleted = BooleanField(default=False)

    meta = {
        'collection': 'evaluation_media'
    }

    def __str__(self):
        return f"{self.media_type.capitalize()} - {self.place or 'Inconnu'} ({self.year})"


class MediaEvaluation(Document):
    evaluator = ReferenceField(CustomUser, required=True)
    media = ReferenceField(Media, required=True)
    beauty = IntField(min_value=1, max_value=5, required=True)
    boring = IntField(min_value=1, max_value=5, required=True)
    depressing = IntField(min_value=1, max_value=5, required=True)
    lively = IntField(min_value=1, max_value=5, required=True)
    wealthy = IntField(min_value=1, max_value=5, required=True)
    safe = IntField(min_value=1, max_value=5, required=True)
    comment = StringField(required=True)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'media_evaluations'
    }
