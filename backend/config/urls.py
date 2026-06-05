from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns  # ← добавить импорт

urlpatterns = [
                  path('i18n/', include('django.conf.urls.i18n')),  # ← ОБЯЗАТЕЛЬНО добавить
                  path('admin/', admin.site.urls),
                  path('api/', include('core.urls')),
                  path('api/calendar/', include('calendar_app.urls')),
                  path('api/treby/', include('treby.urls')),
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
