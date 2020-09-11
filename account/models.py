from django.db import models
from django.contrib.auth.models import User
# how do I write this??? 
# Create your models here.

# extension of User model: the class with one-to-one relationship with it
class Profile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'This profile belongs to {self.user}'