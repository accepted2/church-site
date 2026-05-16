# calendar_app/models.py
from django.db import models


class Feast(models.Model):
    """Святой/праздник (общая информация для поиска)"""
    FEAST_TYPES = [
        ('typikon', 'Типикон'),
        ('lives', 'Жития святых'),
        ('movable', 'Подвижный'),
    ]

    feast_type = models.CharField(max_length=20, choices=FEAST_TYPES, verbose_name="Тип")
    external_id = models.CharField(max_length=50, blank=True, verbose_name="Внешний ID")

    # Для поиска (чтобы найти все даты святого)
    search_name = models.CharField(max_length=500, verbose_name="Имя для поиска")

    class Meta:
        verbose_name = "Святой/праздник"
        verbose_name_plural = "Святые/праздники"
        ordering = ['search_name']

    def __str__(self):
        return self.search_name


class FeastDate(models.Model):
    """Конкретная дата празднования (всё, что показывается пользователю)"""
    DATE_TYPES = [
        ('main', 'Основная дата'),
        ('birth', 'Рождество'),
        ('death', 'Преставление'),
        ('relics', 'Обретение мощей'),
        ('council', 'Собор'),
        ('other', 'Другое'),
    ]

    # Типы праздников из XML
    CELEBRATION_TYPES = [
        ('great', 'Великий'),
        ('middle', 'Средний'),
        ('low', 'Малый'),
        ('', 'Не указан'),
    ]

    RANK_TYPES = [
        ('vigil', 'Всенощное бдение'),
        ('polyeleos', 'Полиелей'),
        ('six_stichera', 'Шестеричный'),
        ('great_doxology', 'Славословный'),
        ('ordinary', 'Обычный'),
        ('', 'Не указан'),
    ]

    feast = models.ForeignKey(Feast, on_delete=models.CASCADE, related_name='dates', verbose_name="Святой/праздник")
    date_type = models.CharField(max_length=20, choices=DATE_TYPES, default='other', verbose_name="Тип даты")

    celebration_type = models.CharField(max_length=20, choices=CELEBRATION_TYPES, blank=True, default='', verbose_name="Тип праздника (great/middle/low)")
    celebration_rank = models.CharField(max_length=30, choices=RANK_TYPES, blank=True, default='', verbose_name="Ранг праздника (vigil/polyeleos/etc)")

    # Дата по старому стилю (для привязки к календарю)
    month = models.IntegerField(verbose_name="Месяц (ст.стиль)")
    day = models.IntegerField(verbose_name="День (ст.стиль)")
    easter_offset = models.IntegerField(null=True, blank=True, verbose_name="Смещение от Пасхи")

    # Что показывается пользователю
    title_ru = models.CharField(max_length=500, verbose_name="Название")
    short_title_ru = models.CharField(max_length=100, blank=True, verbose_name="Краткое название")

    # Икона для этой конкретной даты
    icon = models.ImageField(upload_to='saints_icons/', blank=True, null=True, verbose_name="Икона")
    icon_url = models.URLField(blank=True, null=True, verbose_name="URL иконы")

    # Гимны для этой даты
    troparion_title = models.CharField(max_length=500, blank=True, verbose_name="Тропарь - название")
    troparion_content = models.TextField(blank=True, verbose_name="Тропарь - текст")
    troparion_echo = models.IntegerField(null=True, blank=True, verbose_name="Тропарь - глас")
    kontakion_title = models.CharField(max_length=500, blank=True, verbose_name="Кондак - название")
    kontakion_content = models.TextField(blank=True, verbose_name="Кондак - текст")
    kontakion_echo = models.IntegerField(null=True, blank=True, verbose_name="Кондак - глас")

    # Житие для этой конкретной даты
    life_title = models.CharField(max_length=500, blank=True, verbose_name="Житие - заголовок")
    life_content = models.TextField(blank=True, verbose_name="Житие - текст")

    # Пояснение для админки
    description = models.CharField(max_length=200, blank=True, verbose_name="Пояснение")

    # Порядок сортировки
    order = models.IntegerField(default=0, verbose_name="Порядок")

    class Meta:
        verbose_name = "Дата празднования"
        verbose_name_plural = "Даты празднования"
        ordering = ['order', 'month', 'day']
        unique_together = ['feast', 'month', 'day']

    def __str__(self):
        rank_display = f" [{self.get_celebration_rank_display()}]" if self.celebration_rank else ""
        return f"{self.feast.search_name} — {self.title_ru} ({self.month:02d}.{self.day:02d}){rank_display}"

    def get_gregorian_date(self):
        """Возвращает дату по новому стилю"""
        from datetime import date, timedelta
        julian_date = date(2000, self.month, self.day)
        return julian_date + timedelta(days=13)


class FastType(models.Model):
    """Тип поста (сухоядение, рыба и т.д.)"""
    code = models.CharField(max_length=50, unique=True, verbose_name="Код")
    title_ru = models.CharField(max_length=200, verbose_name="Название (рус.)")

    class Meta:
        verbose_name = "Тип поста"
        verbose_name_plural = "Типы постов"

    def __str__(self):
        return self.title_ru


class Fast(models.Model):
    """Пост"""
    code = models.CharField(max_length=50, unique=True, verbose_name="Код")
    title_ru = models.CharField(max_length=200, verbose_name="Название (рус.)")
    order = models.IntegerField(default=0, verbose_name="Порядок")

    start_month = models.IntegerField(null=True, blank=True, verbose_name="Начало - месяц")
    start_day = models.IntegerField(null=True, blank=True, verbose_name="Начало - день")
    start_easter_offset = models.IntegerField(null=True, blank=True, verbose_name="Начало - от Пасхи")

    end_month = models.IntegerField(null=True, blank=True, verbose_name="Окончание - месяц")
    end_day = models.IntegerField(null=True, blank=True, verbose_name="Окончание - день")
    end_easter_offset = models.IntegerField(null=True, blank=True, verbose_name="Окончание - от Пасхи")

    schedule_json = models.JSONField(default=dict, verbose_name="Расписание")

    class Meta:
        verbose_name = "Пост"
        verbose_name_plural = "Посты"
        ordering = ['order', 'title_ru']

    def __str__(self):
        return self.title_ru


class DayInfo(models.Model):
    """Готовая информация на конкретный день (для быстрого доступа)"""
    date_gregorian = models.DateField(unique=True, verbose_name="Дата (новый стиль)")

    julian_month = models.IntegerField(verbose_name="Месяц (старый стиль)")
    julian_day = models.IntegerField(verbose_name="День (старый стиль)")

    # Старая связь (для совместимости)
    feasts = models.ManyToManyField(Feast, related_name='days', blank=True, verbose_name="Праздники (старое)")

    # Новая связь — конкретные даты празднования
    feast_dates = models.ManyToManyField(FeastDate, related_name='days', blank=True, verbose_name="Праздники")

    # ⭐ ГЛАВНЫЙ СВЯТОЙ ДНЯ (отображается в боковой панели)
    main_feast = models.ForeignKey(
        FeastDate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='main_for_days',
        verbose_name="Главный святой дня"
    )

    fast_type = models.ForeignKey(FastType, null=True, on_delete=models.SET_NULL, verbose_name="Тип поста")
    fast_name = models.CharField(max_length=200, blank=True, verbose_name="Название поста")

    gospel_reading = models.TextField(blank=True, verbose_name="Евангельское чтение")
    apostolic_reading = models.TextField(blank=True, verbose_name="Апостольское чтение")

    summary = models.CharField(max_length=500, blank=True, verbose_name="Краткое описание (полное)")
    short_summary = models.CharField(max_length=200, blank=True, verbose_name="Краткое описание (для календаря)")

    class Meta:
        verbose_name = "День"
        verbose_name_plural = "Дни"
        ordering = ['date_gregorian']
        indexes = [
            models.Index(fields=['date_gregorian']),
        ]

    def __str__(self):
        return f"{self.date_gregorian} (юл: {self.julian_month:02d}-{self.julian_day:02d})"
