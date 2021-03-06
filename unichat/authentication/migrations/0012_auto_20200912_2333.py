# Generated by Django 3.0.8 on 2020-09-12 13:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0011_notificationitem_participating_users'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notificationitem',
            name='last_actor',
        ),
        migrations.AddField(
            model_name='notificationitem',
            name='last_actors',
            field=models.ManyToManyField(related_name='last_actors', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='ParticipatingUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('time', models.BigIntegerField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterField(
            model_name='notificationitem',
            name='participating_users',
            field=models.ManyToManyField(related_name='participating_users', to='authentication.ParticipatingUser'),
        ),
    ]
