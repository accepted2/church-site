from enum import unique

from django.db import models
from django.utils.formats import date_format
from rest_framework.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class ServiceType(models.Model):
    name = models.CharField(max_length=100)
    is_special = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("Тип службы")
        verbose_name_plural = _("Типы служб")

    def __str__(self):
        return self.name


class Schedule(models.Model):
    date = models.DateField(unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Расписание")
        verbose_name_plural = _("Расписания")

    def clean(self):
        if Schedule.objects.exclude(pk=self.pk).filter(date=self.date).exists():
            raise ValidationError(_("Такой день уже существует"))

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

    custom_title_uk = models.CharField(max_length=255, blank=True, verbose_name="Название (укр.)")
    custom_title_ru = models.CharField(max_length=255, blank=True, verbose_name="Название (рус.)")

    class Meta:
        verbose_name = _("Служба")
        verbose_name_plural = _("Службы")

    def __str__(self):
        return f"{self.time}"
