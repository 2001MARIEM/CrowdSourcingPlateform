# evaluation/views.py
from mongoengine.errors import DoesNotExist
from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions
from .models import Media, MediaEvaluation
from .serializers import MediaSerializer, MediaEvaluationSerializer,MediaEvaluationAdminSerializer,MediaEvaluationDetailSerializer
import random
from bson.errors import InvalidId
from collections import defaultdict
from datetime import timedelta
from django.utils import timezone
from django.utils.timezone import is_naive, make_aware
from django.http import JsonResponse
from django.utils.encoding import smart_str
import json
from django.http import HttpResponse


class IsEvaluator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and not request.user.is_staff

#affichage aleatoire des mesdias image/video 
class GetRandomMediaView(APIView):
    permission_classes = [IsEvaluator]

    def get(self, request, media_type):
        if media_type not in ['image', 'video']:
            return Response({"error": "Type de média invalide."}, status=400)

        # Récupérer les IDs évalués, et les convertir en ObjectId
        already_rated_ids_raw = MediaEvaluation.objects(
            evaluator=request.user
        ).distinct('media')

        already_rated_ids = []
        for val in already_rated_ids_raw:
            try:
                already_rated_ids.append(ObjectId(str(val)))
            except InvalidId:
                print(f"[⚠️] ID non valide ignoré : {val}")

        # Requête pour trouver les médias non encore évalués
        media_queryset = Media.objects(
            media_type=media_type,
            deleted=False,
            id__nin=already_rated_ids
        )

        if not media_queryset:
            return Response({"message": "Plus de médias à évaluer."}, status=404)

        # Choisir un média aléatoirement
        random_media = random.choice(media_queryset)
        serializer = MediaSerializer(random_media)
        return Response(serializer.data)

#evaluation des medias
class EvaluateMediaView(APIView):
    permission_classes = [IsEvaluator]

    def post(self, request, media_id):
        try:
            media = Media.objects.get(id=media_id)
        except Media.DoesNotExist:
            return Response({"error": "Média non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        serializer = MediaEvaluationSerializer(data=request.data, context={
            'request': request,
            'media': media
        })
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Évaluation enregistrée."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    
#consulter l'historique d'evaluation 

class UserEvaluationHistoryView(APIView):
    permission_classes = [IsEvaluator]

    def get(self, request):
        user = request.user
        evaluations = MediaEvaluation.objects(evaluator=user).order_by('-created_at')

        if not evaluations:
            return Response({"message": "Vous n'avez pas encore soumis d'évaluations."}, status=404)

        serializer = MediaEvaluationDetailSerializer(evaluations, many=True)
        return Response(serializer.data)

#modifier les evaluations si il n'ont pas passé 24h     

class UpdateEvaluationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, evaluation_id):
        try:
            evaluation = MediaEvaluation.objects.get(id=evaluation_id, evaluator=request.user)
        except MediaEvaluation.DoesNotExist:
            return Response({"error": "Évaluation non trouvée."}, status=404)

        created_at = evaluation.created_at
        if is_naive(created_at):
            created_at = make_aware(created_at)

        if timezone.now() - created_at > timedelta(hours=24):
            return Response({"error": "Modification non autorisée. Évaluation trop ancienne."}, status=403)

        data = request.data
        for field in ['beauty', 'boring', 'depressing', 'lively', 'wealthy', 'safe', 'comment']:
            if field in data:
                setattr(evaluation, field, data[field])

        evaluation.save()
        return Response({"message": "Évaluation modifiée avec succès."})



class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff   
    


class IsAdminOrChercheur(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or getattr(request.user, 'is_chercheur', False)
        )
    

#l'admin ou le chercheur peuvent  voir toutes les evaluations soumises
class ListEvaluationsView(APIView):
    permission_classes = [IsAdminOrChercheur]

    def get(self, request):
        evaluations = MediaEvaluation.objects().order_by('-created_at')

        if not evaluations:
            return Response({"message": "Aucune évaluation enregistrée."}, status=404)

        serializer = MediaEvaluationAdminSerializer(evaluations, many=True)

        # Vérifie si l'utilisateur veut télécharger
        if request.query_params.get('download') == 'true':
            data_json = json.dumps(serializer.data, ensure_ascii=False, indent=2)

            response = HttpResponse(
                data_json,
                content_type='application/json'
            )
            response['Content-Disposition'] = 'attachment; filename="evaluations.json"'
            return response

        # Sinon retourne la réponse normale JSON dans l'API
        return Response(serializer.data)
    



    
#generation des cartes d'ambiances    

class CompositeMapView(APIView):
    permission_classes = [IsAdminUser]  # ou autre selon ton cas

    def get(self, request, year):
        try:
            year = int(year)
        except ValueError:
            return Response({"error": "L'année doit être un entier."}, status=400)

        evaluations = MediaEvaluation.objects()

        if not evaluations:
            return Response({"message": "Aucune donnée disponible."}, status=404)

        square_scores = defaultdict(list)

        for eval in evaluations:
            if eval.media and eval.media.year == year:
                score = (
                    eval.beauty +
                    eval.lively +
                    eval.wealthy +
                    eval.safe -
                    eval.boring -
                    eval.depressing
                )
                square_index = eval.media.square_index
                square_scores[square_index].append(score)

        if not square_scores:
            return Response({"message": f"Aucune donnée pour l'année {year}."}, status=404)

        result = []
        for square_index, scores in square_scores.items():
            avg_score = sum(scores) / len(scores)
            media_sample = Media.objects(square_index=square_index, year=year).first()

            result.append({
                "square_index": square_index,
                "score": round(avg_score, 2),
                "coords": media_sample.coords if media_sample else None
            })

        return Response({str(year): result})
