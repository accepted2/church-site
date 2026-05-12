# calendar_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeastViewSet
from .views_calendar import CalendarMonthView, CalendarDayView, CalendarWeekView

router = DefaultRouter()
router.register(r"feasts", FeastViewSet, basename="feast")

urlpatterns = [
    # Прямые пути
    path('month/', CalendarMonthView.as_view(), name='calendar-month'),
    path('day/', CalendarDayView.as_view(), name='calendar-day'),
    path('week/', CalendarWeekView.as_view(), name='calendar-week'),

    # Router пути (feasts/)
    path('', include(router.urls)),
]
