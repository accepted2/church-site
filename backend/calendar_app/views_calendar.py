# calendar_app/views_calendar.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, date, timedelta
from django.utils import timezone
from .models import DayInfo, Feast, FastType
from .serializers import DayInfoSerializer, FeastSerializer


class CalendarMonthView(APIView):
    """
    Получение данных календаря на месяц
    GET /api/calendar/month/?year=2024&month=1
    """

    def get(self, request):
        # Получаем параметры запроса
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        # Если параметры не указаны, используем текущий месяц
        if not year or not month:
            today = timezone.localtime(timezone.now()).date()
            year = today.year
            month = today.month
        else:
            try:
                year = int(year)
                month = int(month)
            except ValueError:
                return Response(
                    {'error': 'year and month must be integers'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Проверяем валидность месяца
        if month < 1 or month > 12:
            return Response(
                {'error': 'month must be between 1 and 12'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Определяем границы месяца
        start_date = date(year, month, 1)

        # Определяем последний день месяца
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)

        # Получаем данные за месяц с prefetch для оптимизации
        days = DayInfo.objects.filter(
            date_gregorian__gte=start_date,
            date_gregorian__lte=end_date
        ).select_related('fast_type').prefetch_related('feasts')

        # Добавляем дополнительную информацию о днях недели
        serializer = DayInfoSerializer(days, many=True)
        data = serializer.data

        # Обогащаем данные информацией о номере недели и дне недели
        for day_data, day_obj in zip(data, days):
            day_data['weekday'] = day_obj.date_gregorian.weekday()  # 0-6 (пн-вс)
            day_data['week_number'] = day_obj.date_gregorian.isocalendar()[1]

            day_data['is_today'] = day_obj.date_gregorian == timezone.localtime(timezone.now()).date()

        # Добавляем мета-информацию
        response_data = {
            'year': year,
            'month': month,
            'month_name': start_date.strftime('%B'),
            'month_name_ru': self._get_month_name_ru(month),
            'days': data,
            'total_days': len(data),
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
        }

        return Response(response_data)

    def _get_month_name_ru(self, month):
        """Возвращает название месяца на русском"""
        months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ]
        return months[month - 1]


class CalendarDayView(APIView):
    """
    Получение полной информации о конкретном дне
    GET /api/calendar/day/?date=2024-01-07
    или без параметров - сегодняшний день
    """

    def get(self, request):
        # Получаем параметр даты
        date_param = request.query_params.get('date')

        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            target_date = timezone.localtime(timezone.now()).date()

        # Получаем информацию о дне
        try:
            day_info = DayInfo.objects.filter(date_gregorian=target_date) \
                .select_related('fast_type') \
                .prefetch_related('feasts') \
                .first()

            if not day_info:
                return Response(
                    {'error': f'No data found for date {target_date}'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Сериализуем данные
            serializer = DayInfoSerializer(day_info)
            data = serializer.data

            # Добавляем дополнительную информацию
            data['weekday'] = target_date.weekday()
            data['weekday_name_ru'] = self._get_weekday_name_ru(target_date.weekday())
            data['week_number'] = target_date.isocalendar()[1]
            data['is_today'] = target_date == timezone.localtime(timezone.now()).date()

            # Добавляем информацию о посте на сегодня (расширенную)
            if day_info.fast_type:
                data['fast_description'] = self._get_fast_description(day_info.fast_type.code)

            # Добавляем информацию о богослужебных чтениях (если есть)
            # Позже можно добавить из gospel-and-apostolic-readings

            return Response(data)

        except Exception as e:
            return Response(
                {'error': f'Server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _get_weekday_name_ru(self, weekday):
        """Возвращает название дня недели на русском"""
        days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
        return days[weekday]

    def _get_fast_description(self, fast_code):
        """Возвращает описание типа поста"""
        descriptions = {
            'no-fast': 'Поста нет',
            'fast': 'Пост',
            'strict-fast': 'Строгий пост',
            'no-oil': 'Пост без масла',
            'dry': 'Сухоядение',
            'oil': 'Пост с маслом',
            'fish': 'Пост с рыбой',
            'caviar': 'Пост с икрой',
        }
        return descriptions.get(fast_code, fast_code)


class CalendarWeekView(APIView):
    """
    Получение данных на неделю
    GET /api/calendar/week/?date=2024-01-07
    """

    def get(self, request):
        date_param = request.query_params.get('date')

        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            target_date = timezone.localtime(timezone.now()).date()

        # Находим понедельник недели
        monday = target_date - timedelta(days=target_date.weekday())
        sunday = monday + timedelta(days=6)

        # Получаем данные за неделю
        days = DayInfo.objects.filter(
            date_gregorian__gte=monday,
            date_gregorian__lte=sunday
        ).select_related('fast_type').prefetch_related('feasts')

        serializer = DayInfoSerializer(days, many=True)

        response_data = {
            'week_number': target_date.isocalendar()[1],
            'start_date': monday.isoformat(),
            'end_date': sunday.isoformat(),
            'days': serializer.data
        }

        return Response(response_data)
