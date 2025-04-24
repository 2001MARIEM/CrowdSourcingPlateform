from django.urls import path
from .views import GetRandomMediaView, EvaluateMediaView, CompositeMapView,ListEvaluationsView,UserEvaluationHistoryView, UpdateEvaluationView

urlpatterns = [
    #evaluateur
    path('media/random/<str:media_type>/', GetRandomMediaView.as_view(), name='random-media'),
    path('media/evaluate/<str:media_id>/', EvaluateMediaView.as_view(), name='evaluate-media'),

    path('media/evaluation_history/', UserEvaluationHistoryView.as_view(), name='evaluation-history'),
    path('media/evaluation_update/<str:evaluation_id>/', UpdateEvaluationView.as_view(), name='update-evaluation'),

    #admin
    path('view_evaluations_admin/', ListEvaluationsView.as_view(), name='list-evaluations'),
    path('map/composite/<int:year>/', CompositeMapView.as_view(), name='composite-map'),
]
