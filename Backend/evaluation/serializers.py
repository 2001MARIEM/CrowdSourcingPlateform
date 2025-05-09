# evaluation/serializers.py

from rest_framework import serializers
from .models import  Media , MediaEvaluation


class MediaSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    year = serializers.IntegerField()
    square_index = serializers.IntegerField()
    place = serializers.CharField(allow_blank=True, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    media_type = serializers.ChoiceField(choices=Media.MEDIA_TYPE_CHOICES)
    url = serializers.URLField()
    caption = serializers.CharField(allow_blank=True, required=False)
    coords = serializers.DictField(required=False)
    deleted = serializers.BooleanField()



#serializer pour les evaluateurs pour soumettre leurs evaluations 

class MediaEvaluationSerializer(serializers.Serializer):
   
    beauty = serializers.IntegerField(min_value=1, max_value=5)
    boring = serializers.IntegerField(min_value=1, max_value=5)
    depressing = serializers.IntegerField(min_value=1, max_value=5)
    lively = serializers.IntegerField(min_value=1, max_value=5)
    wealthy = serializers.IntegerField(min_value=1, max_value=5)
    safe = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField()

    def create(self, validated_data):
        user = self.context['request'].user
        media = self.context['media']
        evaluation = MediaEvaluation(evaluator=user, media=media, **validated_data)
        evaluation.save()
        return evaluation
    
#serializer pour les evaluateurs pour consulter leurs evaluations
class MediaEvaluationDetailSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    beauty = serializers.IntegerField()
    boring = serializers.IntegerField()
    depressing = serializers.IntegerField()
    lively = serializers.IntegerField()
    wealthy = serializers.IntegerField()
    safe = serializers.IntegerField()
    comment = serializers.CharField()
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    # Média évalué
    media = serializers.SerializerMethodField()

    def get_media(self, obj):
        media = obj.media
        return {
            "id": str(media.id),
            "media_type": media.media_type,
            "url": media.url,
        }    
    



    
#serializer pour l'admin et le chercheur  :plus détaillé stha9itou fi consulter les evaluation
class MediaEvaluationAdminSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    evaluator_email = serializers.SerializerMethodField()
    media_info = serializers.SerializerMethodField()
    beauty = serializers.IntegerField()
    boring = serializers.IntegerField()
    depressing = serializers.IntegerField()
    lively = serializers.IntegerField()
    wealthy = serializers.IntegerField()
    safe = serializers.IntegerField()
    comment = serializers.CharField()
    created_at = serializers.DateTimeField()

    def get_evaluator_email(self, obj):
        return obj.evaluator.email if obj.evaluator else "Inconnu"

    def get_media_info(self, obj):
        if obj.media:
            return {
                "year": obj.media.year,
                "place": obj.media.place,
                "type": obj.media.media_type,
                "url": obj.media.url
            }
        return None
