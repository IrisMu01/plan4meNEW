from django.db import models
from django.contrib.postgres.fields import ArrayField, JSONField
from account.models import Profile
from datetime import date, timedelta
import json

# Create your models here.

# stores a plan (to a certain city) that a user has
class Plan(models.Model):
    belongs_to_user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    date_from = models.DateField()
    date_to = models.DateField()
    city = models.CharField(max_length=300, blank=False)

    def __str__(self):
        return f"{self.belongs_to_user}'s travel plan to {self.city}, from {self.date_from} to {self.date_to}"

# stores all the information about one day's plan
class OneDayPlan(models.Model):
    belongs_to = models.ForeignKey(Plan, on_delete=models.CASCADE)
    date = models.DateField()
    theme = models.CharField(max_length=30, default="no theme")

    places = ArrayField(models.JSONField())
    # JSON format: 
    # {
    #     'addr': string,
    #     'coordinates': {lat: float, lng: float}, (only exists if custom == false)
    #     'custom': bool, 
    #     'name': string,
    #     'place_id': string, (only exists if custom == false)
    #     'types': [string]
    # }

    foods = ArrayField(models.JSONField())
    # JSON format: 
    # {
    #     'addr': string,
    #     'coordinates': {lat: float, lng: float}, (only exists if custom == false)
    #     'custom': bool, 
    #     'name': string,
    #     'place_id': string, (only exists if custom == false)
    #     'price_level': int, (only exists if custom == false)
    #     'rating': float, (only exists if custom == false)
    #     'rating_count': float, (only exists if custom == false)
    #     'types': [string]
    # }

    arrangement = ArrayField(models.IntegerField())
    # how the user is arranging their schedule in that day
    # +i = the (i-1)-th element in self.places, -j = the (j-1)-th element in self.foods
    # how this can change will be defined more in the front end
    
    sleeping_place = models.JSONField()
    # JSON format: ** implement this
    # {
    #     'addr': string, 
    #     'coordinates': {lat: float, lng: float}, (only exists if custom == false)
    #     'custom': bool,
    #     'name': string
    # }

    def __str__(self):
        output = f'Plan on {self.date} with theme {self.theme}: \n'
        for idx in self.arrangement:
            if idx < 0: # is a food
                output += f'Stopping for food at: {self.foods[(idx*-1)-1]}\n'
            else: 
                output += f'Stopping at place: {self.places[idx-1]}\n'
        output += f'Sleeping at this place: {self.sleeping_place}\n uwu ---- uwu ---- uwu\n'
        return output

    def change_sleep(self, newSleepPlace):
        instance = OneDayPlan.objects.get(id=self.id)
        instance.sleeping_place = newPlace
        instance.save()
        return
    
    def change_place(self, idx, newPlace):
        instance = OneDayPlan.objects.get(id=self.id)
        instance.places[idx] = newPlace
        instance.save()
        return
    
    def change_food(self, idx, newFood):
        instance = OneDayPlan.objects.get(id=self.id)
        instance.foods[idx] = newFood
        instance.save()
        return

    def reset_day(self):
        instance = OneDayPlan.objects.get(id=self.id)
        instance.theme = "no theme"
        instance.foods = []
        instance.places = []
        instance.arrangement = []
        instance.sleeping_place = json.load({})
        instance.save()
        return



# generate_plan(dict, django.contrib.auth.models.User)
# -> returns void, creates new Plan and OneDayPlan instances
# (argument for dict param comes from editor.views)
def generate_plan(data, user_inst):
    # 1) get the start and end date from dict
    city = data['city']
    plan_data = data['plans']
    start_date, end_date = 0, 0
    for each_key in plan_data.keys():
        day_plan = plan_data[each_key]
        if start_date == 0:
            start_date = day_plan['date']
        else:
            end_date = day_plan['date']
    # change start_date and end_date from string to datetime.date instance
    start_date = date.fromisoformat(start_date)
    end_date = date.fromisoformat(end_date)
    # final modification to end_date (since last day was not counted in the travel planning process)
    end_date = end_date.replace(day=end_date.day+1)

    # 2) construct an instance of Plan
    the_plan = Plan(
        belongs_to_user=user_inst,
        date_from=start_date,
        date_to=end_date,
        city=city
    )
    the_plan.save()


    # 3-prep) initialize a variable that we will use repeatedly
    pois = ['amusement_park', 'aquarium', 'art_gallery', 'campground', 'casino', 'department_store', 'library', 'movie_theater', 'museum', 'night_club', 'park', 'rv_park', 'shopping_mall', 'spa', 'zoo', 'no theme']

    # 3) iterate through all the days in plan_data, 
    #    construct corresponding OneDayPlan instances
    #    and link them to the_plan created in step 2
    for each_day_key in plan_data:
        # rename the sub-dictionary for syntaxical simplicity
        day_data = plan_data[each_day_key]

        # setting the individual variables (for populating the model fields later)
        the_date = date.fromisoformat(day_data['date'])
        the_theme = pois[day_data['poiIndex']]
        foods, places = [], []
        encoder = json.JSONEncoder()
        places.append(encoder.encode(day_data['place1']))
        places.append(encoder.encode(day_data['place2']))
        foods.append(encoder.encode(day_data['food1']))
        foods.append(encoder.encode(day_data['food2']))
        arrangements = [1, -1, 2, -2]
        if day_data['club']:
            places.append(encoder.encode(day_data['place3']))
            arrangements.append(3)
        if day_data['booze']:
            foods.append(encoder.encode(day_data['food3']))
            arrangements.append(-3)
        sleeping_place = day_data['hotel']

        # create an instance representing this particular day
        plan_today = OneDayPlan(
            date=the_date,
            belongs_to=the_plan,
            theme=the_theme,
            places=places,
            foods=foods,
            arrangement=arrangements,
            sleeping_place=sleeping_place
        )
        plan_today.save()


# called in account/views.py, when user in the profile has made
# changes to the plan's date_from and date_to
# update the corresponding OneDayPlan instances (create/delete when necessary)
def plan_on_date_change(plan_instance):
    Plan_start = plan_instance.date_from
    Plan_end = plan_instance.date_to
    Plan_delta = Plan_end - Plan_start
    # create a list of days where there should be a corresponding OneDayPlan
    should_have_days = [Plan_start + timedelta(days=i) for i in range(Plan_delta.days)]

    # get all the existing OneDayPlan instances
    OneDayPlan_instances = OneDayPlan.objects.filter(belongs_to=plan_instance)

    # remove all the unnecessary days
    for each_day_plan in OneDayPlan_instances:
        the_date = each_day_plan.date
        if the_date < Plan_start or the_date >= Plan_end:
            each_day_plan.delete()

    # add all the necessary days
    for each_day in should_have_days: 
        query_OneDayPlan = OneDayPlan_instances.filter(date=each_day)
        if query_OneDayPlan.count() == 1:
            should_have_days.remove(each_day)
        elif query_OneDayPlan.count() == 0:
            print("this day needs to be added", each_day)
            new_day = OneDayPlan(date=each_day, belongs_to=plan_instance, theme="no theme", foods=[], places=[], arrangement=[], sleeping_place=json.loads("{}"))
            new_day.save()
            should_have_days.remove(each_day)
    
    print([each.date for each in OneDayPlan.objects.filter(belongs_to=plan_instance)])
    
    