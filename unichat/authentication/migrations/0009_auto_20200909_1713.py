# Generated by Django 3.0.8 on 2020-09-09 07:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0008_auto_20200909_1552'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notificationitem',
            name='comment_id',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
    ]