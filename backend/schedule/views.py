from rest_framework import viewsets

from .models import Schedule
from .serializers import ScheduleSerializer


class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        return (
            Schedule.objects.filter(is_active=True).prefetch_related("services").order_by("date")
        )
