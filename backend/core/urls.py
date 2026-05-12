from django.urls import path, include
from .views import get_news

urlpatterns = [
    path('news/', get_news),
    path('schedule/', include('schedule.urls')),

]
