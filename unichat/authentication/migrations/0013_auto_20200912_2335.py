# Generated by Django 3.0.8 on 2020-09-12 13:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0012_auto_20200912_2333'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notificationitem',
            name='action_value',
        ),
        migrations.RemoveField(
            model_name='notificationitem',
            name='last_actors',
        ),
    ]
