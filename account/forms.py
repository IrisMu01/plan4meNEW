import datetime
from django import forms
from django.core.exceptions import ValidationError

class ProfileForm(forms.Form):
    all_changes = forms.CharField(required=True, widget=forms.TextInput(attrs={'id': 'changes-record'}))