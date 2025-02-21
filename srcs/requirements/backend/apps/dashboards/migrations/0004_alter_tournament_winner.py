# Generated by Django 5.1.5 on 2025-02-21 16:11

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboards', '0003_game_finished_tournament_creator_tournament_finished_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='winner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='winner_of_tournament', to='dashboards.participant'),
        ),
    ]
