from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect
from django.urls import reverse
from planner.forms import Input1Form, Input2Form, ResultForm
from django.views import generic
from decouple import config

# Create your views here.

def index(request):
    return render(request, 'index.html', context={})

def input1(request):
    context = {}   
    form = Input1Form()
    context['form'] = form
    context['key'] = config('API_KEY')
    return render(request, 'input1.html', context)

def input2(request):
    context = {}
    context['key'] = config('API_KEY')
    if request.method == 'POST':
        form1 = Input1Form(request.POST)
        if form1.is_valid():
            # process previous form's data
            data = form1.cleaned_data
            place = data['city_name']
            startDate = data['date_from']
            endDate = data['date_to']
            coordinates = data['coordinates']
            # update context
            context['place'] = place
            context['startDate'] = startDate
            context['endDate'] = endDate 
            context['coordinates'] = coordinates
            # create new form for this page
            form2 = Input2Form()
            context['form2'] = form2
    return render(request, 'input2.html', context=context)

def result(request):
    context = {}
    context['key'] = config("API_KEY")
    if request.method == 'POST':
        form2 = Input2Form(request.POST)
        if form2.is_valid():
            message = 'yay!!!uwu'
            data = form2.cleaned_data
            # -----------------
            city = data['city_name']
            date_from = data['date_from']
            date_to = data['date_to']
            coordinates = data['coordinates']
            # -----------------
            hotels = data['hotels']
            pois = data['pois']
            max_price = data['max_price']
            booze_check = data['booze_check']
            # -----------------
            form3 = ResultForm()
            # -----------------
            context['message'] = message
            context['city'] = city
            context['date_from'] = date_from
            context['date_to'] = date_to
            context['coordinates'] = coordinates
            context['hotels'] = hotels
            context['pois'] = pois
            context['max_price'] = max_price
            context['booze_check'] = booze_check
            context['form3'] = form3
            return render(request, 'result.html', context)
        else:
            message = form2.errors
    else:
        message = 'oh no...qwq'
    return render(request, 'result.html', context)