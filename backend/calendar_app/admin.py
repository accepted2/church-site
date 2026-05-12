# calendar_app/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from calendar_app.models import Feast, FastType, Fast, DayInfo


@admin.register(FastType)
class FastTypeAdmin(admin.ModelAdmin):
    list_display = ['code', 'title_ru']
    search_fields = ['code', 'title_ru']
    list_editable = ['title_ru']

    fieldsets = (
        ('Основная информация', {
            'fields': ('code', 'title_ru'),
            'description': "Тип поста: нет поста, dry, масло, рыба и т.д"
        }),
    )


@admin.register(Feast)
class FeastAdmin(admin.ModelAdmin):
    # УБРАЛ external_id из list_display
    list_display = ['display_icon_preview', 'title_ru', 'display_date', 'feast_type']
    list_filter = ['feast_type', 'month']
    search_fields = ['title_ru', 'life_content']  # убрал external_id
    list_per_page = 50

    fieldsets = (
        ('Основная информация', {
            'fields': ('feast_type', 'title_ru'),
            # УБРАЛ external_id
            'description': 'Тип праздника: typikon (из Типикона), lives (жития), movable (подвижные)'
        }),
        ('Дата (старый стиль)', {
            'fields': ('month', 'day', 'easter_offset'),
            'description': 'Для фиксированных: month и day. Для подвижных: easter_offset'
        }),
        ('Икона святого', {
            'fields': ('icon',),  # УБРАЛ icon_url, оставил только загрузку файла
            'description': 'Загрузите икону святого (форматы: JPG, PNG, GIF)'
        }),
        ('Гимны', {
            'fields': ('troparion_title', 'troparion_content', 'troparion_echo',
                       'kontakion_title', 'kontakion_content', 'kontakion_echo'),
            'classes': ('wide',),
        }),
        ('Житие', {
            'fields': ('life_title', 'life_content'),
            'classes': ('wide',),
        }),
    )

    def display_icon_preview(self, obj):
        if obj.icon:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 50%; object-fit: cover;" />', obj.icon.url)
        return "—"

    display_icon_preview.short_description = 'Икона'

    def display_date(self, obj):
        if obj.feast_type == 'movable' and obj.easter_offset:
            return f"Пасха+{obj.easter_offset}"
        elif obj.month and obj.day:
            return f"{obj.month:02d}.{obj.day:02d} (ст.стиль)"
        return "—"

    display_date.short_description = 'Дата'


@admin.register(DayInfo)
class DayInfoAdmin(admin.ModelAdmin):
    list_display = ['date_gregorian', 'display_julian', 'fast_name', 'display_feasts_preview']
    list_filter = ['date_gregorian', 'fast_type']
    search_fields = ['summary', 'fast_name', 'feasts__title_ru']
    date_hierarchy = 'date_gregorian'
    filter_horizontal = ['feasts']

    fieldsets = (
        ('Даты', {
            'fields': ('date_gregorian', 'julian_month', 'julian_day'),
        }),
        ('Пост', {
            'fields': ('fast_type', 'fast_name'),
        }),
        ('Праздники и жития', {
            'fields': ('feasts',),
            'description': mark_safe(
                'Выберите праздники для этого дня. '
                '<a href="{}" target="_blank">➕ Создать нового святого/праздник</a>'
            ),
        }),
        ('Дополнительно', {
            'fields': ('summary', 'gospel_reading', 'apostolic_reading'),
            'classes': ('wide',),
        }),
    )

    def get_form(self, request, obj=None, **kwargs):
        """Добавляем кнопку создания нового праздника"""
        form = super().get_form(request, obj, **kwargs)
        return form

    def render_change_form(self, request, context, *args, **kwargs):
        """Добавляем ссылку на создание нового праздника"""
        add_url = reverse('admin:calendar_app_feast_add')
        context['add_feast_url'] = add_url
        return super().render_change_form(request, context, *args, **kwargs)

    def response_add(self, request, obj, *args, **kwargs):
        """После добавления дня - возвращаемся к списку"""
        return super().response_add(request, obj, *args, **kwargs)

    def display_julian(self, obj):
        return f"{obj.julian_day:02d}.{obj.julian_month:02d}"

    display_julian.short_description = 'Юлианская дата'

    def display_feasts_preview(self, obj):
        feasts = obj.feasts.all()[:3]
        if feasts:
            return ", ".join([f.title_ru[:30] for f in feasts])
        return "—"

    display_feasts_preview.short_description = 'Праздники'

    actions = ['regenerate_summary']

    def regenerate_summary(self, request, queryset):
        for day in queryset:
            feast_titles = [f.title_ru for f in day.feasts.all()[:3]]
            day.summary = '; '.join(feast_titles)
            day.save()
        self.message_user(request, f'Обновлено {queryset.count()} дней')

    regenerate_summary.short_description = 'Перегенерировать краткое описание'
