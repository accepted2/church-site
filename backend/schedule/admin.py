from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Service, Schedule, ServiceType


class ServiceInline(admin.TabularInline):
    model = Service
    extra = 1


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ("formatted_date", "is_active")
    list_editable = ("is_active",)
    list_filter = ("is_active",)
    inlines = [ServiceInline]
    ordering = ("date",)

    def formatted_date(self, obj):
        from django.utils.formats import date_format
        return date_format(obj.date, "l (d.m.Y)")

    formatted_date.short_description = _("Дата")


@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "is_special")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('time', 'custom_title_ru', 'custom_title_uk', 'type')
    fields = ('schedule', 'time', 'type', 'custom_title_ru', 'custom_title_uk')
