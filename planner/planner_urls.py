from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('input1/', views.input1, name='input1'),
    path('input2/', views.input2, name='input2'),
    path('result/', views.result, name='result')
]