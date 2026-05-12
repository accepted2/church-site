# calendar_app/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from django.utils import timezone
from .models import Feast, DayInfo, FastType
from .serializers import FeastSerializer, DayInfoSerializer


class FeastViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для работы с праздниками
    """
    queryset = Feast.objects.all()
    serializer_class = FeastSerializer

    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """
        Получить праздники по дате (старый стиль)
        GET /api/feasts/by_date/?month=1&day=7
        """
        month = request.query_params.get('month')
        day = request.query_params.get('day')

        if not month or not day:
            return Response(
                {'error': 'month and day parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            month = int(month)
            day = int(day)
        except ValueError:
            return Response(
                {'error': 'month and day must be integers'},
                status=status.HTTP_400_BAD_REQUEST
            )

        feasts = Feast.objects.filter(
            month=month,
            day=day
        ).exclude(feast_type='movable')

        serializer = self.get_serializer(feasts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def movable(self, request):
        """
        Получить подвижные праздники
        """
        year = request.query_params.get('year', timezone.now().year)

        try:
            year = int(year)
        except ValueError:
            return Response(
                {'error': 'year must be integer'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Здесь нужна логика расчета дат подвижных праздников для конкретного года
        # Можно вычислить Пасху и затем все зависимые праздники

        feasts = Feast.objects.filter(feast_type='movable')
        serializer = self.get_serializer(feasts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Поиск праздников по названию
        GET /api/feasts/search/?q=Рождество
        """
        query = request.query_params.get('q', '')

        if not query:
            return Response(
                {'error': 'q parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        feasts = Feast.objects.filter(title_ru__icontains=query)
        serializer = self.get_serializer(feasts, many=True)
        return Response(serializer.data)
