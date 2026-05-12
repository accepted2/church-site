# calendar_app/models.py
from django.db import models


class Feast(models.Model):
    """Праздник из typikon-feasts или lives-of-the-saints"""
    FEAST_TYPES = [
        ('typikon', 'Типикон'),
        ('lives', 'Жития святых'),
        ('movable', 'Подвижный'),
    ]

    feast_type = models.CharField(
        max_length=20,
        choices=FEAST_TYPES,
        verbose_name="Тип праздника"
    )
    external_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Внешний ID"
    )
    title_ru = models.CharField(
        max_length=500,
        verbose_name="Название (рус.)"
    )
    month = models.IntegerField(
        null=True, blank=True,
        verbose_name="Месяц (старый стиль)"
    )
    day = models.IntegerField(
        null=True, blank=True,
        verbose_name="День (старый стиль)"
    )
    easter_offset = models.IntegerField(
        null=True, blank=True,
        verbose_name="Смещение от Пасхи (дней)"
    )

    icon = models.ImageField(
        upload_to='saints_icons/',
        blank=True,
        null=True,
        verbose_name="Икона (файл)"
    )
    icon_url = models.URLField(
        blank=True,
        null=True,
        verbose_name="Икона (URL)"
    )

    # Гимны
    troparion_title = models.CharField(
        max_length=500, blank=True,
        verbose_name="Тропарь - название"
    )
    troparion_content = models.TextField(
        blank=True,
        verbose_name="Тропарь - текст"
    )
    troparion_echo = models.IntegerField(
        null=True, blank=True,
        verbose_name="Тропарь - глас"
    )
    kontakion_title = models.CharField(
        max_length=500, blank=True,
        verbose_name="Кондак - название"
    )
    kontakion_content = models.TextField(
        blank=True,
        verbose_name="Кондак - текст"
    )
    kontakion_echo = models.IntegerField(
        null=True, blank=True,
        verbose_name="Кондак - глас"
    )

    # Для житий
    life_title = models.CharField(
        max_length=500, blank=True,
        verbose_name="Житие - заголовок"
    )
    life_content = models.TextField(
        blank=True,
        verbose_name="Житие - текст"
    )

    # Ссылки
    refs = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        verbose_name="Связанные праздники"
    )

    class Meta:
        verbose_name = "Праздник"
        verbose_name_plural = "Праздники"
        ordering = ['month', 'day']
        indexes = [
            models.Index(fields=['month', 'day', 'feast_type']),
        ]

    def __str__(self):
        if self.month and self.day:
            return f"{self.month:02d}-{self.day:02d}: {self.title_ru}"
        elif self.easter_offset:
            return f"Пасха+{self.easter_offset}: {self.title_ru}"
        else:
            return self.title_ru


class FastType(models.Model):
    """Тип поста (сухоядение, рыба и т.д.)"""
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Код"
    )
    title_ru = models.CharField(
        max_length=200,
        verbose_name="Название (рус.)"
    )

    class Meta:
        verbose_name = "Тип поста"
        verbose_name_plural = "Типы постов"

    def __str__(self):
        return self.title_ru


class Fast(models.Model):
    """Пост"""
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Код"
    )
    title_ru = models.CharField(
        max_length=200,
        verbose_name="Название (рус.)"
    )
    order = models.IntegerField(
        default=0,
        verbose_name="Порядок"
    )

    start_month = models.IntegerField(
        null=True, blank=True,
        verbose_name="Начало - месяц"
    )
    start_day = models.IntegerField(
        null=True, blank=True,
        verbose_name="Начало - день"
    )
    start_easter_offset = models.IntegerField(
        null=True, blank=True,
        verbose_name="Начало - от Пасхи"
    )

    end_month = models.IntegerField(
        null=True, blank=True,
        verbose_name="Окончание - месяц"
    )
    end_day = models.IntegerField(
        null=True, blank=True,
        verbose_name="Окончание - день"
    )
    end_easter_offset = models.IntegerField(
        null=True, blank=True,
        verbose_name="Окончание - от Пасхи"
    )

    schedule_json = models.JSONField(
        default=dict,
        verbose_name="Расписание"
    )

    class Meta:
        verbose_name = "Пост"
        verbose_name_plural = "Посты"
        ordering = ['order', 'title_ru']

    def __str__(self):
        return self.title_ru


class DayInfo(models.Model):
    """Готовая информация на конкретный день (для быстрого доступа)"""
    date_gregorian = models.DateField(
        unique=True,
        verbose_name="Дата (новый стиль)"
    )

    julian_month = models.IntegerField(
        verbose_name="Месяц (старый стиль)"
    )
    julian_day = models.IntegerField(
        verbose_name="День (старый стиль)"
    )

    feasts = models.ManyToManyField(
        Feast,
        related_name='days',
        verbose_name="Праздники"
    )

    fast_type = models.ForeignKey(
        FastType,
        null=True,
        on_delete=models.SET_NULL,
        verbose_name="Тип поста"
    )
    fast_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Название поста"
    )

    gospel_reading = models.TextField(
        blank=True,
        verbose_name="Евангельское чтение"
    )
    apostolic_reading = models.TextField(
        blank=True,
        verbose_name="Апостольское чтение"
    )

    summary = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Краткое описание"
    )

    class Meta:
        verbose_name = "День"
        verbose_name_plural = "Дни"
        ordering = ['date_gregorian']
        indexes = [
            models.Index(fields=['date_gregorian']),
        ]

    def __str__(self):
        return f"{self.date_gregorian} (юл: {self.julian_month:02d}-{self.julian_day:02d})"
