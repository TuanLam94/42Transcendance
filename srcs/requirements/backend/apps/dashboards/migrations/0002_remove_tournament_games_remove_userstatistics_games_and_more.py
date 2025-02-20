# Generated by Django 5.1.5 on 2025-02-19 13:49

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboards', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournament',
            name='games',
        ),
        migrations.RemoveField(
            model_name='userstatistics',
            name='games',
        ),
        migrations.RemoveField(
            model_name='userstatistics',
            name='tournaments',
        ),
        migrations.AlterField(
            model_name='game',
            name='tournament',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='games', to='dashboards.tournament'),
        ),
    ]
