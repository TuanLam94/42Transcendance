# Generated by Django 5.1.5 on 2025-02-11 13:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_merge_20250211_1339'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='two_factor_type',
        ),
    ]
