from django.contrib import admin
from django.urls import path
from django.conf.urls import url
from . import views

urlpatterns = [
    path('', views.sign_up, name="sign-up"),
    path('sign_up/', views.sign_up, name="sign-up"),
    path('profile/', views.ProfileView.as_view(), name="profile"),
    url(r'^ajax/profile_user_action/$', views.profile_user_action, name="profile_user_action"),
]