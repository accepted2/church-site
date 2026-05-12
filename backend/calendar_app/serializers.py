# calendar_app/serializers.py
from rest_framework import serializers
from .models import Feast, DayInfo, FastType


class FeastSerializer(serializers.ModelSerializer):
    feast_type_display = serializers.CharField(source='get_feast_type_display', read_only=True)

    class Meta:
        model = Feast
        fields = [
            'id', 'feast_type', 'feast_type_display', 'title_ru',
            'month', 'day', 'easter_offset',
            'troparion_title', 'troparion_content', 'troparion_echo',
            'kontakion_title', 'kontakion_content', 'kontakion_echo',
            'life_title', 'life_content', 'external_id'
        ]


class FastTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FastType
        fields = ['id', 'code', 'title_ru']


class DayInfoSerializer(serializers.ModelSerializer):
    feasts = FeastSerializer(many=True, read_only=True)
    fast_type_title = serializers.CharField(source='fast_type.title_ru', read_only=True)
    fast_type_code = serializers.CharField(source='fast_type.code', read_only=True)
    date_str = serializers.SerializerMethodField()

    class Meta:
        model = DayInfo
        fields = [
            'id', 'date_gregorian', 'date_str', 'julian_month', 'julian_day',
            'feasts', 'fast_type', 'fast_type_title', 'fast_type_code',
            'fast_name', 'summary'
        ]

    def get_date_str(self, obj):
        return obj.date_gregorian.strftime('%Y-%m-%d')
