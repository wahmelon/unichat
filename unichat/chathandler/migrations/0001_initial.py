# Generated by Django 3.0.8 on 2020-08-26 08:28

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('authentication', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Topic',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('created_time', models.BigIntegerField()),
                ('upvotes', models.PositiveSmallIntegerField(default=0)),
                ('downvotes', models.PositiveSmallIntegerField(default=0)),
                ('audience', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='authentication.Group')),
                ('poster', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['created_time'],
            },
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('poster', models.TextField()),
                ('content', models.TextField()),
                ('created_time', models.BigIntegerField()),
                ('upvotes', models.PositiveSmallIntegerField()),
                ('downvotes', models.PositiveSmallIntegerField()),
                ('topic_owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='chathandler.Topic')),
            ],
            options={
                'ordering': ['created_time'],
            },
        ),
    ]
