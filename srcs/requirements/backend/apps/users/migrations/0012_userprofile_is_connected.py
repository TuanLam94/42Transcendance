# Generated by Django 5.1.5 on 2025-02-28 13:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_userprofile_blocked_userprofile_friends'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_connected',
            field=models.BooleanField(default=False),
        ),
    ]
