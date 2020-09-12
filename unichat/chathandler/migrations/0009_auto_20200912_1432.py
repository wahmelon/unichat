# Generated by Django 3.0.8 on 2020-09-12 04:32

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('authentication', '0010_auto_20200912_1432'),
        ('chathandler', '0008_auto_20200903_2300'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='history',
            field=models.ManyToManyField(related_name='history', to='authentication.NotificationItem'),
        ),
        migrations.AlterField(
            model_name='topic',
            name='followed_by',
            field=models.ManyToManyField(related_name='topics_followed', to=settings.AUTH_USER_MODEL),
        ),
    ]
