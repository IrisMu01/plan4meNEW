# Generated by Django 3.0.2 on 2020-07-23 18:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0002_input'),
    ]

    operations = [
        migrations.AddField(
            model_name='input',
            name='message',
            field=models.TextField(default="doesn't have a message"),
            preserve_default=False,
        ),
    ]
