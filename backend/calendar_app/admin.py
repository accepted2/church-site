# calendar_app/admin.py
from django import forms
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib.admin import DateFieldListFilter
from django.utils.translation import gettext_lazy as _
from calendar_app.models import Feast, FeastDate, FastType, Fast, DayInfo, Icon
from datetime import datetime


@admin.register(FastType)
class FastTypeAdmin(admin.ModelAdmin):
    list_display = ['code', 'title_ru', 'title_uk']
    search_fields = ['code', 'title_ru', 'title_uk']
    list_editable = ['title_ru', 'title_uk']

    fieldsets = (
        (_('Основная информация'), {
            'fields': ('code', 'title_ru', 'title_uk'),
            'description': _("Тип поста: нет поста, dry, масло, рыба и т.д")
        }),
    )


class FeastDateInline(admin.TabularInline):
    model = FeastDate
    extra = 1
    fields = ['feast', 'title_ru', 'short_title_ru', 'title_uk', 'short_title_uk', 'month', 'day', 'display_gregorian_inline', 'celebration_type', 'celebration_rank']
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
            return _("— (подвижный)")
        return "—"

    display_gregorian_inline.short_description = _('Новый стиль')


@admin.register(Feast)
class FeastAdmin(admin.ModelAdmin):
    list_display = ['id', 'search_name', 'feast_type', 'dates_count', 'display_dates']
    list_filter = ['feast_type']
    search_fields = ['search_name', 'external_id', 'dates__title_ru', 'dates__short_title_ru']
    inlines = [FeastDateInline]

    fieldsets = (
        (_('Основная информация'), {
            'fields': ('feast_type', 'search_name', 'external_id'),
        }),
    )

    def dates_count(self, obj):
        count = obj.dates.count()
        return format_html('<a href="?feast__id={}">{}</a>', obj.id, _('{} дат').format(count))

    dates_count.short_description = _('Дат празднования')

    def display_dates(self, obj):
        """Показывает все даты празднования святого"""
        dates = obj.dates.all().order_by('month', 'day')
        if not dates:
            return "—"

        date_list = []
        for fd in dates:
            if fd.easter_offset is not None:
                date_str = f"{_('Пасха')}+{fd.easter_offset}"
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

    display_dates.short_description = _('Даты (ст.стиль → н.стиль)')


class IconInline(admin.TabularInline):
    model = Icon
    extra = 1
    fields = ['image', 'is_main', 'order']
    ordering = ['order']
    max_num = 10


@admin.register(FeastDate)
class FeastDateAdmin(admin.ModelAdmin):
    list_display = [
        'display_icon_with_link',
        'link_to_edit',
        'short_title_ru',
        'title_uk',
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
        'title_uk', 'short_title_uk',
        'feast__search_name',
        'troparion_content', 'kontakion_content', 'life_content'
    ]
    list_per_page = 50
    list_select_related = ['feast']
    inlines = [IconInline]

    fieldsets = (
        (_('Святой/праздник'), {
            'fields': ('feast',),
        }),
        (_('Даты'), {
            'fields': ('month', 'day', 'easter_offset', 'display_gregorian_info'),
            'description': _('Дата по старому стилю. Новый стиль вычисляется автоматически (+13 дней)')
        }),
        (_('Названия (рус./укр.)'), {  # ← изменено
            'fields': ('title_ru', 'title_uk', 'short_title_ru', 'short_title_uk', 'date_type'),
        }),
        (_('Тип и ранг праздника'), {
            'fields': ('celebration_type', 'celebration_rank'),
        }),
        (_('Икона'), {
            'fields': ('icon', 'icon_url'),
        }),
        (_('Гимны (рус.)'), {  # ← оставляем русские
            'fields': (
                'troparion_title', 'troparion_content', 'troparion_echo',
                'kontakion_title', 'kontakion_content', 'kontakion_echo'
            ),
            'classes': ('wide',),
        }),
        (_('Гимны (укр.)'), {  # 🆕 добавить украинские гимны
            'fields': (
                'troparion_title_uk', 'troparion_content_uk',
                'kontakion_title_uk', 'kontakion_content_uk',
            ),
            'classes': ('wide',),
        }),
        (_('Житие (рус.)'), {
            'fields': ('life_title', 'life_content'),
            'classes': ('wide',),
        }),
        (_('Житие (укр.)'), {  # 🆕 добавить украинское житие
            'fields': ('life_title_uk', 'life_content_uk'),
            'classes': ('wide',),
        }),
        (_('Дополнительно'), {
            'fields': ('description', 'order', 'description_uk',),
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

    display_icon_with_link.short_description = _('Икона')

    def link_to_edit(self, obj):
        url = reverse('admin:calendar_app_feastdate_change', args=[obj.id])
        icon_html = '🖼️ ' if obj.icon else ''
        return format_html('<a href="{}" style="font-weight: bold; color: #c4a67d;">{}{}</a>', url, icon_html, obj.title_ru)

    link_to_edit.short_description = _('Праздник')

    def display_date(self, obj):
        if obj.easter_offset:
            return f"{_('Пасха')}+{obj.easter_offset}"
        return f"{obj.month:02d}.{obj.day:02d}"

    display_date.short_description = _('Старый стиль')

    def display_gregorian(self, obj):
        if obj.month and obj.day and not obj.easter_offset:
            from datetime import date, timedelta
            julian_date = date(2000, obj.month, obj.day)
            gregorian_date = julian_date + timedelta(days=13)
            return f"{gregorian_date.day:02d}.{gregorian_date.month:02d}"
        elif obj.easter_offset:
            return _("— (подвижный)")
        return "—"

    display_gregorian.short_description = _('Новый стиль')

    def display_gregorian_info(self, obj):
        if obj.month and obj.day and not obj.easter_offset:
            from datetime import date, timedelta
            julian_date = date(2000, obj.month, obj.day)
            gregorian_date = julian_date + timedelta(days=13)
            weekdays = [_('Понедельник'), _('Вторник'), _('Среда'), _('Четверг'), _('Пятница'), _('Суббота'), _('Воскресенье')]
            return mark_safe(
                f'<div style="background: #e8f0e0; padding: 10px; border-radius: 8px;">'
                f'📅 <strong>{gregorian_date.day:02d}.{gregorian_date.month:02d}.{gregorian_date.year}</strong><br>'
                f'📆 {weekdays[gregorian_date.weekday()]}'
                f'</div>'
            )
        elif obj.easter_offset:
            return mark_safe(
                '<div style="background: #f0e6d2; padding: 10px; border-radius: 8px;">'
                f'📅 <strong>{_("Подвижный праздник")}</strong><br>'
                f'{_("Дата зависит от Пасхи и меняется каждый год")}'
                '</div>'
            )
        return "—"

    display_gregorian_info.short_description = _('Новый стиль (инфо)')

    def has_troparion(self, obj):
        return "✅" if obj.troparion_content else "❌"

    has_troparion.short_description = _('Тропарь')

    def has_life(self, obj):
        return "✅" if obj.life_content else "❌"

    has_life.short_description = _('Житие')

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
            self.message_user(request, f'{_("Скопировано")}: {new_date.title_ru}')

    copy_to_new_date.short_description = _('Копировать на следующий день')


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
    readonly_fields = ('date_gregorian',)
    list_display = ['date_calendar_link', 'display_julian', 'fast_name', 'fast_name_uk', 'main_feast_preview', 'display_feasts_preview']

    list_filter = [
        ('date_gregorian', DateFieldListFilter),
        'fast_type',
        'feast_dates__celebration_type',
    ]

    search_fields = ['summary', 'summary_uk', 'short_summary', 'short_summary_uk', 'fast_name', 'fast_name_uk', 'feast_dates__title_ru', 'feast_dates__title_uk']
    date_hierarchy = 'date_gregorian'
    filter_horizontal = ['feast_dates']
    list_per_page = 50

    fieldsets = (
        (_('Даты'), {
            'fields': ('date_gregorian', 'julian_month', 'julian_day'),
            'description': _('📅 Выберите дату с помощью календаря'),
        }),
        (_('Пост'), {
            'fields': ('fast_type', 'fast_name', 'fast_name_uk'),
        }),
        (_('🌟 Главный святой дня'), {
            'fields': ('main_feast',),
            'description': _('Выберите святого, который будет отображаться в боковой панели'),
        }),
        (_('📖 Все святые дня'), {
            'fields': ('feast_dates',),
            'description': _('Все святые и праздники этого дня'),
        }),
        (_('Дополнительно'), {
            'fields': ('summary', 'summary_uk', 'short_summary', 'short_summary_uk',),
            'classes': ('wide',),
        }),
        (_('Евангельское чтение'), {
            'fields': ('gospel_title', 'gospel_title_uk', 'gospel_reading', 'gospel_reading_uk'),
            'classes': ('wide',),
            'description': _('Заголовок и текст Евангельского чтения на русском и украинском языках.'),
        }),
        (_('Апостольское чтение'), {
            'fields': ('apostolic_title', 'apostolic_title_uk', 'apostolic_reading', 'apostolic_reading_uk'),
            'classes': ('wide',),
            'description': _('Заголовок и текст Апостольского чтения на русском и украинском языках.'),
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

    date_calendar_link.short_description = _('Дата')

    def main_feast_preview(self, obj):
        if obj.main_feast:
            return format_html(
                '<span style="color: #c4a67d;">★</span> {}',
                obj.main_feast.title_ru[:40]
            )
        return "—"

    main_feast_preview.short_description = _('Главный святой')

    def link_to_day(self, obj):
        url = reverse('admin:calendar_app_dayinfo_change', args=[obj.id])
        return format_html('<a href="{}">📅 {}</a>', url, obj.date_gregorian)

    link_to_day.short_description = _('Дата (новый стиль)')

    def display_julian(self, obj):
        return f"{obj.julian_day:02d}.{obj.julian_month:02d}"

    display_julian.short_description = _('Старый стиль')

    def display_feasts_preview(self, obj):
        feasts = obj.feast_dates.all()[:3]
        if feasts:
            return ", ".join([f'{f.short_title_ru or f.title_ru}'[:35] for f in feasts])
        return "—"

    display_feasts_preview.short_description = _('Праздники')

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
            feast_titles_uk = [f.title_uk or f.title_ru for f in day.feast_dates.all()[:3]]  # 🆕
            day.summary = '; '.join(feast_titles)
            day.summary_uk = '; '.join(feast_titles_uk)  # 🆕
            day.short_summary = '; '.join([f.short_title_ru or f.title_ru for f in day.feast_dates.all()[:3]])
            day.short_summary_uk = '; '.join([f.short_title_uk or f.title_ru for f in day.feast_dates.all()[:3]])  # 🆕
            day.save()
        self.message_user(request, f'{_("Обновлено")} {queryset.count()} {_("дней")}')

    regenerate_summary.short_description = _('Перегенерировать краткое описание')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "main_feast":
            object_id = request.resolver_match.kwargs.get('object_id')

            if object_id:
                try:
                    day = self.get_object(request, object_id)
                    if day:
                        kwargs["queryset"] = day.feast_dates.all()
                except (ValueError, AttributeError):
                    pass
            else:
                kwargs["queryset"] = FeastDate.objects.none()

        return super().formfield_for_foreignkey(db_field, request, **kwargs)
