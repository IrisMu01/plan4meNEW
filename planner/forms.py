import datetime
from django import forms
from django.core.exceptions import ValidationError

class Input1Form(forms.Form):
    city_name = forms.CharField(max_length=150, widget=forms.TextInput(attrs={'id': 'get-city-name', 'placeholder': "I'm travelling to..."}), label='First of all, which city are we travelling to?')
    date_from = forms.DateField(widget=forms.DateInput(attrs={'id': 'date-from', 'type': 'date'}), label='When will your trip start and end?')
    date_to = forms.DateField(widget=forms.DateInput(attrs={'id': 'date-to', 'type': 'date'}))
    coordinates = forms.CharField(widget=forms.HiddenInput(attrs={'id': 'coordinates'}))

class Input2Form(forms.Form):
    # on this page, will carry the data posted from input1.html to result.html
    city_name = forms.CharField(max_length=150, widget=forms.HiddenInput(attrs={'id': 'input1-city-name'}))
    date_from = forms.CharField(widget=forms.HiddenInput(attrs={'id': 'input1-date-from'}))
    date_to = forms.CharField(widget=forms.HiddenInput(attrs={'id': 'input1-date-to'}))
    coordinates = forms.CharField(widget=forms.HiddenInput(attrs={'id': 'input1-coordinates'}))
    # ==================================
    hotels = forms.CharField(max_length=4096, widget=forms.HiddenInput(attrs={'id':'hotel-form-data'}))
    # takes stringified json data
    # will set the widget to hidden input later
    # ============================
    amusement_park, aquarium, art_gallery, campground, casino = 0, 1, 2, 3, 4
    department_store, library, movie_theatre, museum, night_club = 5, 6, 7, 8, 9
    park, rv_park, shopping_mall, spa, zoo = 10, 11, 12, 13, 14
    POI_CHOICES = [
        (amusement_park, 'amusement park'),
        (aquarium, 'aquarium'),
        (art_gallery, 'art gallery'),
        (campground, 'campground'),
        (casino, 'casino'),
        (department_store, 'department store'),
        (library, 'library'),
        (movie_theatre, 'movie theatre'),
        (museum, 'museum'),
        (night_club, 'night club'),
        (park, 'park'),
        (rv_park, 'RV park'),
        (shopping_mall, 'shopping mall'),
        (spa, 'spa'),
        (zoo, 'zoo'),
    ]
    pois = forms.MultipleChoiceField(
        choices=POI_CHOICES,
        widget=forms.CheckboxSelectMultiple(attrs={'id': 'poi-choices'})
    )
    # ============================
    max_price = forms.IntegerField(min_value=1, max_value=4, initial=3, widget=forms.HiddenInput(attrs={'id': 'max-price-data'}))
    booze_check = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={'id': 'booze-check'})
    )

class ResultForm(forms.Form):
    all_data = forms.CharField(widget=forms.HiddenInput(attrs={'id': 'all-data'}))