from rest_framework import serializers
from .models import Schedule, Service, ServiceType


class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ["id", "time", "title"]

    def get_title(self, obj):
        request = self.context.get('request')
        lang = request.LANGUAGE_CODE if request else 'ru'
        print(f"LANG: {lang}, ID: {obj.id}")  # ← отладка

        if lang == 'uk' and obj.custom_title_uk:
            return obj.custom_title_uk
        if lang == 'ru' and obj.custom_title_ru:
            return obj.custom_title_ru
        if obj.custom_title_ru:
            return obj.custom_title_ru
        if obj.type:
            return obj.type.name
        return ""


class ScheduleSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    weekday = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = ["id", "date", "weekday", "services"]

    def get_services(self, obj):
        request = self.context.get('request')
        serializer = ServiceSerializer(obj.services.all(), many=True, context={'request': request})
        return serializer.data

    def get_weekday(self, obj):
        return obj.date.strftime("%A")
