# Generated by Django 5.1.5 on 2025-01-15 17:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transcendance', '0004_alltimestatistics_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_logged_in',
            field=models.BooleanField(default=False),
        ),
    ]
