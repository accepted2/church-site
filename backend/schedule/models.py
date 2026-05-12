from enum import unique

from django.db import models
from django.utils.formats import date_format
from rest_framework.exceptions import ValidationError


class ServiceType(models.Model):
    name = models.CharField(max_length=100)
    is_special = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Schedule(models.Model):
    date = models.DateField(unique=True)
    is_active = models.BooleanField(default=True)

    def clean(self):
        if Schedule.objects.exclude(pk=self.pk).filter(date=self.date).exists():
            raise ValidationError("Такой жень уже существует")

    def __str__(self):
        return date_format(self.date, "l (d.m.Y)")


class Service(models.Model):
    schedule = models.ForeignKey(
        Schedule,
        related_name="services",
        on_delete=models.CASCADE
    )

    time = models.TimeField()

    type = models.ForeignKey(
        ServiceType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    custom_title = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.time}"
