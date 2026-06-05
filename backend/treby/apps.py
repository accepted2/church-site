from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class TrebyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'treby'
    verbose_name = _('Треби')  # ← для перевода названия приложения в админке
