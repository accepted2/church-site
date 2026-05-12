from django.contrib import admin

from .models import Service, Schedule, ServiceType


# Register your models here.

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

    formatted_date.short_description = "Дата"


@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "is_special")
