# Generated by Django 3.0.2 on 2020-07-24 01:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0003_input_message'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='input',
            name='message',
        ),
    ]
