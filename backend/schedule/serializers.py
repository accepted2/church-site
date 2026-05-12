from rest_framework import serializers
from .models import Schedule, Service, ServiceType


class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    type = serializers.StringRelatedField()
    title = serializers.SerializerMethodField()
    time = serializers.TimeField(format="%H:%M")

    class Meta:
        model = Service
        fields = ["id", "time", "type", "custom_title", "title"]

    def get_title(self, obj):
        if obj.custom_title:
            return obj.custom_title
        if obj.type:
            return obj.type.name
        return ""


class ScheduleSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    weekday = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = ["id", "date", "weekday", "services"]

    def get_weekday(self, obj):
        return obj.date.strftime("%A")
