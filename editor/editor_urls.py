from django.urls import path
from . import views

urlpatterns = [
    path('', views.EditorView.as_view(), name='editor'),
]