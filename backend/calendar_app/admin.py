# calendar_app/admin.py
from django import forms
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib.admin import DateFieldListFilter
from calendar_app.models import Feast, FeastDate, FastType, Fast, DayInfo
from datetime import datetime


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


class FeastDateInline(admin.TabularInline):
    model = FeastDate
    extra = 1
    fields = ['feast', 'title_ru', 'short_title_ru', 'month', 'day', 'display_gregorian_inline', 'celebration_type', 'celebration_rank']
    readonly_fields = ['display_gregorian_inline']
    show_change_link = True
    autocomplete_fields = ['feast']
    
    def display_gregorian_inline(self, obj):
        if obj.month and obj.day and not obj.easter_offset:
            from datetime import date, timedelta
            julian_date = date(2000, obj.month, obj.day)
            gregorian_date = julian_date + timedelta(days=13)
            return f"{gregorian_date.day:02d}.{gregorian_date.month:02d}"
        elif obj.easter_offset:
            return "— (подвижный)"
        return "—"

    display_gregorian_inline.short_description = 'Новый стиль'


@admin.register(Feast)
class FeastAdmin(admin.ModelAdmin):
    list_display = ['id', 'search_name', 'feast_type', 'dates_count', 'display_dates']
    list_filter = ['feast_type']
    search_fields = ['search_name', 'external_id', 'dates__title_ru', 'dates__short_title_ru']
    inlines = [FeastDateInline]

    fieldsets = (
        ('Основная информация', {
            'fields': ('feast_type', 'search_name', 'external_id'),
        }),
    )

    def dates_count(self, obj):
        count = obj.dates.count()
        return format_html('<a href="?feast__id={}">{} дат</a>', obj.id, count)

    dates_count.short_description = 'Дат празднования'

    def display_dates(self, obj):
        """Показывает все даты празднования святого"""
        dates = obj.dates.all().order_by('month', 'day')
        if not dates:
            return "—"

        date_list = []
        for fd in dates:
            if fd.easter_offset is not None:
                date_str = f"Пасха+{fd.easter_offset}"
            else:
                # Старый стиль
                old_style = f"{fd.day:02d}.{fd.month:02d}"
                # Новый стиль
                from datetime import date, timedelta
                julian = date(2000, fd.month, fd.day)
                gregorian = julian + timedelta(days=13)
                new_style = f"{gregorian.day:02d}.{gregorian.month:02d}"
                date_str = f"{old_style} → {new_style}"

            # Добавляем тип даты, если не основная
            if fd.date_type != 'main' and fd.date_type != 'other':
                type_display = fd.get_date_type_display()
                date_str = f"{date_str} ({type_display})"

            date_list.append(date_str)

        return ", ".join(date_list)

    display_dates.short_description = 'Даты (ст.стиль → н.стиль)'


@admin.register(FeastDate)
class FeastDateAdmin(admin.ModelAdmin):
    list_display = [
        'display_icon_with_link',
        'link_to_edit',
        'short_title_ru',
        'display_date',
        'display_gregorian',
        'celebration_type',
        'celebration_rank',
        'has_troparion',
        'has_life'
    ]
    list_filter = ['celebration_type', 'celebration_rank', 'date_type', 'feast__feast_type']
    search_fields = [
        'title_ru', 'short_title_ru',
        'feast__search_name',
        'troparion_content', 'kontakion_content', 'life_content'
    ]
    list_per_page = 50
    list_select_related = ['feast']

    fieldsets = (
        ('Святой/праздник', {
            'fields': ('feast',),
        }),
        ('Даты', {
            'fields': ('month', 'day', 'easter_offset', 'display_gregorian_info'),
            'description': 'Дата по старому стилю. Новый стиль вычисляется автоматически (+13 дней)'
        }),
        ('Названия', {
            'fields': ('title_ru', 'short_title_ru', 'date_type'),
        }),
        ('Тип и ранг праздника', {
            'fields': ('celebration_type', 'celebration_rank'),
        }),
        ('Икона', {
            'fields': ('icon', 'icon_url'),
        }),
        ('Гимны', {
            'fields': (
                'troparion_title', 'troparion_content', 'troparion_echo',
                'kontakion_title', 'kontakion_content', 'kontakion_echo'
            ),
            'classes': ('wide',),
        }),
        ('Житие', {
            'fields': ('life_title', 'life_content'),
            'classes': ('wide',),
        }),
        ('Дополнительно', {
            'fields': ('description', 'order'),
        }),
    )

    readonly_fields = ['display_gregorian_info']

    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super().get_search_results(request, queryset, search_term)
        search_term = search_term.strip()

        if '.' in search_term or '-' in search_term:
            sep = '.' if '.' in search_term else '-'
            parts = search_term.split(sep)
            if len(parts) == 2:
                try:
                    day = int(parts[0])
                    month = int(parts[1])
                    queryset |= self.model.objects.filter(month=month, day=day)
                except ValueError:
                    pass
        return queryset, use_distinct

    def display_icon_with_link(self, obj):
        url = reverse('admin:calendar_app_feastdate_change', args=[obj.id])
        if obj.icon:
            return format_html(
                '<a href="{}"><img src="{}" width="40" height="40" style="border-radius: 50%; object-fit: cover; border: 1px solid #ddd;" /></a>',
                url, obj.icon.url
            )
        return format_html(
            '<a href="{}" style="display: inline-block; width: 40px; height: 40px; background: transparent; border-radius: 50%;"></a>',
            url
        )

    display_icon_with_link.short_description = 'Икона'

    def link_to_edit(self, obj):
        url = reverse('admin:calendar_app_feastdate_change', args=[obj.id])
        icon_html = '🖼️ ' if obj.icon else ''
        return format_html('<a href="{}" style="font-weight: bold; color: #c4a67d;">{}{}</a>', url, icon_html, obj.title_ru)

    link_to_edit.short_description = 'Праздник'

    def display_date(self, obj):
        if obj.easter_offset:
            return f"Пасха+{obj.easter_offset}"
        return f"{obj.month:02d}.{obj.day:02d}"

    display_date.short_description = 'Старый стиль'

    def display_gregorian(self, obj):
        if obj.month and obj.day and not obj.easter_offset:
            from datetime import date, timedelta
            julian_date = date(2000, obj.month, obj.day)
            gregorian_date = julian_date + timedelta(days=13)
            return f"{gregorian_date.day:02d}.{gregorian_date.month:02d}"
        elif obj.easter_offset:
            return "— (подвижный)"
        return "—"

    display_gregorian.short_description = 'Новый стиль'

    def display_gregorian_info(self, obj):
        if obj.month and obj.day and not obj.easter_offset:
            from datetime import date, timedelta
            julian_date = date(2000, obj.month, obj.day)
            gregorian_date = julian_date + timedelta(days=13)
            weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
            return mark_safe(
                f'<div style="background: #e8f0e0; padding: 10px; border-radius: 8px;">'
                f'📅 <strong>{gregorian_date.day:02d}.{gregorian_date.month:02d}.{gregorian_date.year}</strong><br>'
                f'📆 {weekdays[gregorian_date.weekday()]}'
                f'</div>'
            )
        elif obj.easter_offset:
            return mark_safe(
                '<div style="background: #f0e6d2; padding: 10px; border-radius: 8px;">'
                '📅 <strong>Подвижный праздник</strong><br>'
                'Дата зависит от Пасхи и меняется каждый год'
                '</div>'
            )
        return "—"

    display_gregorian_info.short_description = 'Новый стиль (инфо)'

    def has_troparion(self, obj):
        return "✅" if obj.troparion_content else "❌"

    has_troparion.short_description = 'Тропарь'

    def has_life(self, obj):
        return "✅" if obj.life_content else "❌"

    has_life.short_description = 'Житие'

    actions = ['copy_to_new_date']

    def copy_to_new_date(self, request, queryset):
        for feast_date in queryset:
            new_date = FeastDate.objects.create(
                feast=feast_date.feast,
                title_ru=feast_date.title_ru,
                short_title_ru=feast_date.short_title_ru,
                month=feast_date.month,
                day=feast_date.day + 1,
                troparion_content=feast_date.troparion_content,
                kontakion_content=feast_date.kontakion_content,
                life_content=feast_date.life_content,
            )
            self.message_user(request, f'Скопировано: {new_date.title_ru}')

    copy_to_new_date.short_description = 'Копировать на следующий день'


class DayInfoForm(forms.ModelForm):
    class Meta:
        model = DayInfo
        fields = '__all__'
        widgets = {
            'date_gregorian': forms.DateInput(attrs={'type': 'date', 'class': 'vDateField'}),
        }


@admin.register(DayInfo)
class DayInfoAdmin(admin.ModelAdmin):
    form = DayInfoForm

    list_display = ['date_calendar_link', 'display_julian', 'fast_name', 'main_feast_preview', 'display_feasts_preview']

    # ✅ Улучшенные фильтры
    list_filter = [
        ('date_gregorian', DateFieldListFilter),  # календарь в фильтре
        # 'date_gregorian__year',  # фильтр по году
        'fast_type',
        'feast_dates__celebration_type',
    ]

    search_fields = ['summary', 'short_summary', 'fast_name', 'feast_dates__title_ru']
    date_hierarchy = 'date_gregorian'
    filter_horizontal = ['feast_dates']
    list_per_page = 50

    fieldsets = (
        ('Даты', {
            'fields': ('date_gregorian', 'julian_month', 'julian_day'),
            'description': '📅 Выберите дату с помощью календаря',
        }),
        ('Пост', {
            'fields': ('fast_type', 'fast_name'),
        }),
        ('🌟 Главный святой дня', {
            'fields': ('main_feast',),
            'description': 'Выберите святого, который будет отображаться в боковой панели',
        }),
        ('📖 Все святые дня', {
            'fields': ('feast_dates',),
            'description': 'Все святые и праздники этого дня',
        }),
        ('Дополнительно', {
            'fields': ('summary', 'short_summary', 'gospel_reading', 'apostolic_reading'),
            'classes': ('wide',),
        }),
    )

    def date_calendar_link(self, obj):
        url = reverse('admin:calendar_app_dayinfo_change', args=[obj.id])
        return format_html(
            '<a href="{}" style="display: flex; align-items: center; gap: 6px;">'
            '<span style="font-size: 16px;">📅</span> <strong>{}</strong>'
            '</a>',
            url, obj.date_gregorian.strftime('%d.%m.%Y')
        )

    date_calendar_link.short_description = 'Дата'

    def main_feast_preview(self, obj):
        if obj.main_feast:
            return format_html(
                '<span style="color: #c4a67d;">★</span> {}',
                obj.main_feast.title_ru[:40]
            )
        return "—"

    main_feast_preview.short_description = 'Главный святой'

    def link_to_day(self, obj):
        url = reverse('admin:calendar_app_dayinfo_change', args=[obj.id])
        return format_html('<a href="{}">📅 {}</a>', url, obj.date_gregorian)

    link_to_day.short_description = 'Дата (новый стиль)'

    def display_julian(self, obj):
        return f"{obj.julian_day:02d}.{obj.julian_month:02d}"

    display_julian.short_description = 'Старый стиль'

    def display_feasts_preview(self, obj):
        feasts = obj.feast_dates.all()[:3]
        if feasts:
            return ", ".join([f'{f.short_title_ru or f.title_ru}'[:35] for f in feasts])
        return "—"

    display_feasts_preview.short_description = 'Праздники'

    def get_model_perms(self, request):
        return {
            'add': True,
            'change': True,
            'delete': True,
            'view': True,
        }

    actions = ['regenerate_summary']

    def regenerate_summary(self, request, queryset):
        for day in queryset:
            feast_titles = [f.title_ru for f in day.feast_dates.all()[:3]]
            day.summary = '; '.join(feast_titles)
            day.short_summary = '; '.join([f.short_title_ru or f.title_ru for f in day.feast_dates.all()[:3]])
            day.save()
        self.message_user(request, f'Обновлено {queryset.count()} дней')

    regenerate_summary.short_description = 'Перегенерировать краткое описание'

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Ограничиваем выбор главного святого только теми, кто есть в feast_dates этого дня"""
        if db_field.name == "main_feast":
            # Получаем ID текущего объекта (если редактируем существующий)
            object_id = request.resolver_match.kwargs.get('object_id')

            if object_id:
                try:
                    day = self.get_object(request, object_id)
                    if day:
                        # Ограничиваем выбор только святыми из feast_dates
                        kwargs["queryset"] = day.feast_dates.all()
                except (ValueError, AttributeError):
                    pass
            else:
                # Для нового дня — показываем пустой список (пользователь сначала добавит святых)
                kwargs["queryset"] = FeastDate.objects.none()

        return super().formfield_for_foreignkey(db_field, request, **kwargs)
