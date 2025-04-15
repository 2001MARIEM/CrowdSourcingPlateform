from django.urls import path
from .views import RegisterView, LoginView , UserProfileView,EvaluatorListView,DeactivateUserView,ReactivateUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path("me/", UserProfileView.as_view(), name="user-profile"),# espace utilisateur 'consult et modifie infos
    
    path('admin/evaluateurs/', EvaluatorListView.as_view(), name='liste-evaluateurs'),
    path('admin/desactiver/<int:user_id>/', DeactivateUserView.as_view(), name='desactiver-utilisateur'),
    path('admin/reactiver/<int:user_id>/', ReactivateUserView.as_view(), name='reactiver-utilisateur'),
]
