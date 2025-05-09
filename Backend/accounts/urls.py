from django.urls import path
from .views import RegisterView, LoginView , UserProfileView,EvaluatorListView,DeactivateUserView,ReactivateUserView,CreateAdminUserView,ForgotPasswordView, ResetPasswordView , CreateChercheurUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<str:token>/', ResetPasswordView.as_view(), name='reset-password'),
    path("me/", UserProfileView.as_view(), name="user-profile"),# espace utilisateur 'consult et modifie infos


    path('admin/create/', CreateAdminUserView.as_view(), name='create-admin'),
    
    path('admin/evaluateurs/', EvaluatorListView.as_view(), name='liste-evaluateurs'),
    path('admin/desactiver/<str:user_id>/', DeactivateUserView.as_view(), name='desactiver-utilisateur'),
    path('admin/reactiver/<str:user_id>/', ReactivateUserView.as_view(), name='reactiver-utilisateur'),
    path('admin/chercheurs/', CreateChercheurUserView.as_view(), name='create-chercheur'),
]
