# Generated by Django 5.1.5 on 2025-01-17 17:15

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transcendance', '0010_alter_tournament_games'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='games',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tournaments', to='transcendance.game'),
        ),
    ]
