from rest_framework import viewsets
from .models import Schedule
from .serializers import ScheduleSerializer


class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        return (
            Schedule.objects.filter(is_active=True)
            .prefetch_related("services")
            .order_by("date")
        )
