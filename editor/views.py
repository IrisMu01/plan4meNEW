from django.shortcuts import render
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views import View
from django.utils.decorators import method_decorator
from planner.models import Plan, OneDayPlan


# Create your views here.

@method_decorator(login_required, name='dispatch')
class EditorView(View):
    template_name = 'editor.html'
    model = OneDayPlan

    def get_view_context(self, request):
        context = {}
        user = User.objects.get(id=request.session['_auth_user_id'])
        the_plan = Plan.objects.get(id=request.session['plan_to_edit_id'])
        day_plans = OneDayPlan.objects.filter(belongs_to=the_plan)
        context['username'] = user.get_username()
        context['big_plan'] = the_plan
        context['small_plans'] = day_plans
        return context

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, self.get_view_context(request))
    
    def post(self, request, *args, **kwargs):
        return render(request, self.template_name, self.get_view_context(request))