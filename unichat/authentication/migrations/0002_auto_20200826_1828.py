# Generated by Django 3.0.8 on 2020-08-26 08:28

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('chathandler', '0001_initial'),
        ('authentication', '0001_initial'),
        ('auth', '0011_update_proxy_permissions'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentuser',
            name='comments_posted',
            field=models.ManyToManyField(blank=True, to='chathandler.Comment'),
        ),
        migrations.AddField(
            model_name='studentuser',
            name='current_groups',
            field=models.ManyToManyField(related_name='groupss_list', to='authentication.Group'),
        ),
        migrations.AddField(
            model_name='studentuser',
            name='groups',
            field=models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.Group', verbose_name='groups'),
        ),
        migrations.AddField(
            model_name='studentuser',
            name='topics_posted',
            field=models.ManyToManyField(blank=True, to='chathandler.Topic'),
        ),
        migrations.AddField(
            model_name='studentuser',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.Permission', verbose_name='user permissions'),
        ),
    ]