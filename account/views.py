from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from account.forms import ProfileForm
from account.models import Profile
from planner.forms import ResultForm
from planner.models import OneDayPlan, Plan, plan_on_date_change, generate_plan
import json
from datetime import date

# Create your views here.

def sign_up(request):
    context = {}

    # this is always created
    signup_form = UserCreationForm(request.POST or None) 

    # will be handy if user enters the registration page through the button on /planner/result/
    data_form = ResultForm(request.POST or None)

    if request.method == "POST":

        if data_form.is_valid():
            # clean and format the string data into json format
            clean_data = data_form.cleaned_data
            str_data = clean_data['all_data'].replace("&quot;", '"')
            json_data = json.loads(str_data)
            # save data into the session cookie
            request.session['temp_data'] = json_data

        elif signup_form.is_valid():
            # after registration and login the session's "temp_data" is removed
            # (since it's no longer an anonymous user activity);
            # save the data in a variable first
            if 'temp_data' in request.session.keys():
                data = request.session['temp_data']
            else: 
                data = 0
            user = signup_form.save()
            login(request, user)
            # add that temp_data back into session data
            if data != 0: 
                request.session['temp_data'] = data
            # create a profile for the user
            this_user = User.objects.get(id=request.session['_auth_user_id'])
            new_profile = Profile(user=this_user)
            new_profile.save()

            # additional plan generation if the user signed up with a plan
            if 'temp_data' in request.session.keys():
                user_pk = request.session['_auth_user_id']
                plan_data = request.session['temp_data']
                user_instance = User.objects.get(id=user_pk)
                profile_instance = Profile.objects.get(user=user_instance)
                generate_plan(plan_data, profile_instance)

            return HttpResponseRedirect('/account/profile/')

        else: # neither is valid; clear 'temp_data' from session
            print(request.session.keys())
            if 'temp_data' in request.session.keys():
                del request.session['temp_data']

    context['signup_form'] = signup_form
    context['data_form'] = data_form
    
    return render(request, 'sign_up.html', context)

# =========================================================================

# writing a cbv for profile
@method_decorator(login_required, name='dispatch')
class ProfileView(View):
    template_name = 'profile.html'
    model = Plan

    def get_view_context(self, request):
        context = {}
        this_user = User.objects.get(id=request.session['_auth_user_id'])
        their_profile = Profile.objects.get(user=this_user)
        their_plans = Plan.objects.filter(belongs_to_user=their_profile)
        # ['plans'] holds a list of dictionaries of this format:
        # {"username": str, "city": str, "date_from": iso_format_str, "date_to": iso_format_str}
        plans_lst = []
        for each in their_plans:
            plans_lst.append({
                "id": each.id,
                "username": each.belongs_to_user,
                "city": each.city,
                "date_from": each.date_from,
                "date_to": each.date_to
            })
        context['plans'] = plans_lst
        context['username'] = this_user.get_username()
        return context

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, self.get_view_context(request))
    
    def post(self, request, *args, **kwargs):
        return render(request, self.template_name, self.get_view_context(request))


def profile_user_action(request):
    # extract the data step 1
    data = json.loads(request.GET.get('data'))
    changed_date = data['change_date']
    edit_target = data['edit_target'] # false | str
    delete_targets = data['delete_target']

    # initialize the dict to be jsonalized for response
    response = {}

    if delete_targets != False:
        plan_pks = [int(each[4:]) for each in delete_targets]
        plan_instances = Plan.objects.filter(id__in=plan_pks)
        for each in plan_instances:
            each.delete()
        response['success'] = True
        response['action'] = 'delete'
        response['plan_id'] = -1
    elif changed_date != False:
        for key in changed_date.keys():
            # extract the data step 2
            plan_pk = int(key[4:])
            new_date_from = changed_date[key][0]['date-from'] # string of iso format
            new_date_to = changed_date[key][1]['date-to'] # string of iso format
            # save to the specific plan instance
            plan_instance = Plan.objects.get(id=plan_pk)
            plan_instance.date_from = date.fromisoformat(new_date_from)
            plan_instance.date_to = date.fromisoformat(new_date_to)
            plan_instance.save()
            # create/delete necessary OneDayPlan instances according to the new changes in date
            plan_on_date_change(plan_instance)
        response['success'] = True
        response['action'] = 'change_dates'
        response['plan_id'] = -1
    elif edit_target != False:
        plan_pk = int(edit_target[4:])
        response['success'] = True
        response['action'] = 'edit'
        response['plan_id'] = plan_pk
        request.session['plan_to_edit_id'] = plan_pk
    return JsonResponse(response)