# calendar_app/serializers.py
from rest_framework import serializers
from .models import Feast, FeastDate, DayInfo, FastType


class FeastDateSerializer(serializers.ModelSerializer):
    """Сериализатор для даты празднования (то, что идет в API)"""
    celebration_type_display = serializers.CharField(source='get_celebration_type_display', read_only=True)
    celebration_rank_display = serializers.CharField(source='get_celebration_rank_display', read_only=True)
    date_type_display = serializers.CharField(source='get_date_type_display', read_only=True)

    class Meta:
        model = FeastDate
        fields = [
            'id',
            'date_type', 'date_type_display',
            'celebration_type', 'celebration_type_display',
            'celebration_rank', 'celebration_rank_display',
            'title_ru', 'short_title_ru',
            'month', 'day', 'easter_offset',
            'icon', 'icon_url',
            'troparion_title', 'troparion_content', 'troparion_echo',
            'kontakion_title', 'kontakion_content', 'kontakion_echo',
            'life_title', 'life_content',
        ]


class FeastSerializer(serializers.ModelSerializer):
    """Сериализатор для святого (возвращает все даты)"""
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
    class Meta:
        model = FastType
        fields = ['id', 'code', 'title_ru']


class DayInfoSerializer(serializers.ModelSerializer):
    """Сериализатор для дня — возвращает главного святого и всех святых"""
    # Главный святой дня
    main_feast = FeastDateSerializer(read_only=True)
    # Все святые дня
    all_feasts = FeastDateSerializer(many=True, read_only=True, source='feast_dates')
    fast_type_title = serializers.CharField(source='fast_type.title_ru', read_only=True)
    fast_type_code = serializers.CharField(source='fast_type.code', read_only=True)
    date_str = serializers.SerializerMethodField()

    class Meta:
        model = DayInfo
        fields = [
            'id', 'date_gregorian', 'date_str', 'julian_month', 'julian_day',
            'main_feast',  # ← главный святой (один)
            'all_feasts',  # ← все святые (много)
            'fast_type', 'fast_type_title', 'fast_type_code',
            'fast_name', 'summary', 'short_summary'
        ]

    def get_date_str(self, obj):
        return obj.date_gregorian.strftime('%Y-%m-%d')
