# calendar_app/serializers.py
from datetime import timedelta

from django.conf import settings
from rest_framework import serializers
from django.utils.translation import get_language
from .models import Feast, FeastDate, DayInfo, FastType, Icon
from .utils._calculate_easter import calculate_easter, gregorian_from_julian


class FeastDateShortSerializer(serializers.ModelSerializer):
    """Упрощённый сериализатор для списка дат (без вложенных полей)"""
    title = serializers.SerializerMethodField()
    short_title = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()
    gregorian_date = serializers.SerializerMethodField()

    class Meta:
        model = FeastDate
        fields = [
            'id', 'month', 'day', 'easter_offset',
            'title', 'short_title', 'icon',
            "gregorian_date",
        ]

    def get_gregorian_date(self, obj):
        year = self.context.get('year')
        if not year:
            from django.utils import timezone
            year = timezone.now().year

        if obj.easter_offset is not None:
            easter = calculate_easter(year)
            if easter:
                date_obj = easter + timedelta(days=obj.easter_offset)
                return date_obj.strftime('%Y-%m-%d')

        else:
            if obj.month and obj.day:
                gregorian = gregorian_from_julian(obj.month, obj.day, year)
                return gregorian.strftime('%Y-%m-%d')
        return None

    def get_title(self, obj):
        lang = get_language()
        if lang == 'uk' and obj.title_uk:
            return obj.title_uk
        return obj.title_ru

    def get_short_title(self, obj):
        lang = get_language()
        if lang == 'uk' and obj.short_title_uk:
            return obj.short_title_uk
        return obj.short_title_ru

    def get_icon(self, obj):
        if obj.icon:
            request = self.context.get('request')
            url = obj.icon.url
            return request.build_absolute_uri(url) if request else url
        return None


class IconSerializer(serializers.ModelSerializer):
    class Meta:
        model = Icon
        fields = ['id', 'image', 'is_main', 'order']


class FeastDateSerializer(serializers.ModelSerializer):
    celebration_type_display = serializers.CharField(source='get_celebration_type_display', read_only=True)
    celebration_rank_display = serializers.CharField(source='get_celebration_rank_display', read_only=True)
    date_type_display = serializers.CharField(source='get_date_type_display', read_only=True)

    icons = IconSerializer(many=True, read_only=True)
    main_icon = serializers.SerializerMethodField()

    # 🆕 Локализованные поля
    title = serializers.SerializerMethodField()
    short_title = serializers.SerializerMethodField()
    troparion_title = serializers.SerializerMethodField()
    troparion_content = serializers.SerializerMethodField()
    kontakion_title = serializers.SerializerMethodField()
    kontakion_content = serializers.SerializerMethodField()
    life_title = serializers.SerializerMethodField()
    life_content = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    icon = serializers.SerializerMethodField()
    all_dates = serializers.SerializerMethodField()
    gregorian_date = serializers.SerializerMethodField()

    # icon = serializers.ImageField(read_only=True)

    class Meta:
        model = FeastDate
        fields = [
            'id',
            'date_type', 'date_type_display',
            'celebration_type', 'celebration_type_display',
            'celebration_rank', 'celebration_rank_display',
            'title', 'short_title',
            'month', 'day', 'easter_offset',
            'icon',
            'troparion_title', 'troparion_content', 'troparion_echo',
            'kontakion_title', 'kontakion_content', 'kontakion_echo',
            'life_title', 'life_content',
            'description',
            'all_dates',
            'gregorian_date',
            'icons',
            'main_icon',
        ]

    def get_main_icon(self, obj):
        main_icon = obj.icons.filter(is_main=True).first()
        if not main_icon:
            main_icon = obj.icons.first()
        if main_icon and main_icon.image:
            request = self.context.get('request')
            url = main_icon.image.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_gregorian_date(self, obj):
        year = self.context.get('year')
        if not year:
            from django.utils import timezone
            year = timezone.now().year

        if obj.easter_offset is not None:
            easter = calculate_easter(year)
            if easter:
                date_obj = easter + timedelta(days=obj.easter_offset)
                return date_obj.strftime('%Y-%m-%d')
        else:
            if obj.month and obj.day:
                gregorian = gregorian_from_julian(obj.month, obj.day, year)
                return gregorian.strftime('%Y-%m-%d')
        return None

    def get_all_dates(self, obj):
        """Возвращает все даты празднования этого же святого (Feast)"""
        if obj.feast:
            dates = obj.feast.dates.all()
            # Используем упрощённый сериализатор, чтобы избежать рекурсии
            return FeastDateShortSerializer(dates, many=True, context=self.context).data
        return []

    def get_icon(self, obj):
        if obj.icon:
            request = self.context.get('request')
            url = obj.icon.url
            return request.build_absolute_uri(url) if request else url
        return None

    def _get_localized(self, obj, field_ru, field_uk):
        lang = get_language()
        if lang == 'uk' and getattr(obj, field_uk, None):
            return getattr(obj, field_uk)
        return getattr(obj, field_ru)

    def get_title(self, obj):
        return self._get_localized(obj, 'title_ru', 'title_uk')

    def get_short_title(self, obj):
        return self._get_localized(obj, 'short_title_ru', 'short_title_uk')

    def get_troparion_title(self, obj):
        return self._get_localized(obj, 'troparion_title', 'troparion_title_uk')

    def get_troparion_content(self, obj):
        return self._get_localized(obj, 'troparion_content', 'troparion_content_uk')

    def get_kontakion_title(self, obj):
        return self._get_localized(obj, 'kontakion_title', 'kontakion_title_uk')

    def get_kontakion_content(self, obj):
        return self._get_localized(obj, 'kontakion_content', 'kontakion_content_uk')

    def get_life_title(self, obj):
        return self._get_localized(obj, 'life_title', 'life_title_uk')

    def get_life_content(self, obj):
        return self._get_localized(obj, 'life_content', 'life_content_uk')

    def get_description(self, obj):
        return self._get_localized(obj, 'description', 'description_uk')


class FeastSerializer(serializers.ModelSerializer):
    feast_type_display = serializers.CharField(source='get_feast_type_display', read_only=True)
    dates = FeastDateSerializer(many=True, read_only=True)

    class Meta:
        model = Feast
        fields = [
            'id', 'feast_type', 'feast_type_display',
            'search_name',
            'dates',
        ]


class FastTypeSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()

    class Meta:
        model = FastType
        fields = ['id', 'code', 'title']

    def get_title(self, obj):
        lang = get_language()
        if lang == 'uk' and obj.title_uk:
            return obj.title_uk
        return obj.title_ru


class DayInfoSerializer(serializers.ModelSerializer):
    main_feast = FeastDateSerializer(read_only=True)
    all_feasts = FeastDateSerializer(many=True, read_only=True, source='feast_dates')
    fast_type_title = serializers.SerializerMethodField()
    fast_type_code = serializers.CharField(source='fast_type.code', read_only=True)
    fast_name = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()
    short_summary = serializers.SerializerMethodField()
    date_str = serializers.SerializerMethodField()
    gospel_title = serializers.SerializerMethodField()
    apostolic_title = serializers.SerializerMethodField()
    gospel_reading = serializers.SerializerMethodField()
    apostolic_reading = serializers.SerializerMethodField()

    class Meta:
        model = DayInfo
        fields = [
            'id', 'date_gregorian', 'date_str', 'julian_month', 'julian_day',
            'main_feast',
            'all_feasts',
            'fast_type', 'fast_type_title', 'fast_type_code',
            'fast_name', 'summary', 'short_summary',
            'gospel_title', 'gospel_reading',
            'apostolic_title', 'apostolic_reading',
        ]

    def _get_localized(self, obj, field_ru, field_uk):
        lang = get_language()
        if lang == 'uk' and getattr(obj, field_uk, None):
            return getattr(obj, field_uk)
        return getattr(obj, field_ru)

    def get_fast_type_title(self, obj):
        if obj.fast_type:
            lang = get_language()
            if lang == 'uk' and obj.fast_type.title_uk:
                return obj.fast_type.title_uk
            return obj.fast_type.title_ru
        return ''

    def get_fast_name(self, obj):
        return self._get_localized(obj, 'fast_name', 'fast_name_uk')

    def get_gospel_title(self, obj):
        return self._get_localized(obj, 'gospel_title', 'gospel_title_uk')

    def get_apostolic_title(self, obj):
        return self._get_localized(obj, 'apostolic_title', 'apostolic_title_uk')

    def get_gospel_reading(self, obj):
        return self._get_localized(obj, 'gospel_reading', 'gospel_reading_uk')

    def get_apostolic_reading(self, obj):
        return self._get_localized(obj, 'apostolic_reading', 'apostolic_reading_uk')

    def get_summary(self, obj):
        return self._get_localized(obj, 'summary', 'summary_uk')

    def get_short_summary(self, obj):
        return self._get_localized(obj, 'short_summary', 'short_summary_uk')

    def get_date_str(self, obj):
        return obj.date_gregorian.strftime('%Y-%m-%d')
