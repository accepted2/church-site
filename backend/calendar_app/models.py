# calendar_app/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _


class Feast(models.Model):
    """Святой/праздник (общая информация для поиска)"""
    FEAST_TYPES = [
        ('typikon', _('Типикон')),
        ('lives', _('Жития святых')),
        ('movable', _('Подвижный')),
    ]

    feast_type = models.CharField(max_length=20, choices=FEAST_TYPES, verbose_name=_("Тип"))
    external_id = models.CharField(max_length=50, blank=True, verbose_name=_("Внешний ID"))
    search_name = models.CharField(max_length=500, verbose_name=_("Имя для поиска"))

    class Meta:
        verbose_name = _("Святой/праздник")
        verbose_name_plural = _("Святые/праздники")
        ordering = ['search_name']

    def __str__(self):
        return self.search_name


class FeastDate(models.Model):
    """Конкретная дата празднования (всё, что показывается пользователю)"""
    DATE_TYPES = [
        ('main', _('Основная дата')),
        ('birth', _('Рождество')),
        ('death', _('Преставление')),
        ('relics', _('Обретение мощей')),
        ('council', _('Собор')),
        ('other', _('Другое')),
    ]

    CELEBRATION_TYPES = [
        ('great', _('Великий')),
        ('middle', _('Средний')),
        ('low', _('Малый')),
        ('', _('Не указан')),
    ]

    RANK_TYPES = [
        ('vigil', _('Всенощное бдение')),
        ('polyeleos', _('Полиелей')),
        ('six_stichera', _('Шестеричный')),
        ('great_doxology', _('Славословный')),
        ('ordinary', _('Обычный')),
        ('', _('Не указан')),
    ]

    feast = models.ForeignKey(Feast, on_delete=models.CASCADE, related_name='dates', verbose_name=_("Святой/праздник"))
    date_type = models.CharField(max_length=20, choices=DATE_TYPES, default='other', verbose_name=_("Тип даты"))

    celebration_type = models.CharField(max_length=20, choices=CELEBRATION_TYPES, blank=True, default='', verbose_name=_("Тип праздника (great/middle/low)"))
    celebration_rank = models.CharField(max_length=30, choices=RANK_TYPES, blank=True, default='', verbose_name=_("Ранг праздника (vigil/polyeleos/etc)"))

    month = models.IntegerField(
        verbose_name=_("Месяц (ст.стиль)"),
        null=True,
        blank=True
    )
    day = models.IntegerField(
        verbose_name=_("День (ст.стиль)"),
        null=True,
        blank=True
    )
    easter_offset = models.IntegerField(
        null=True,
        blank=True,
        verbose_name=_("Смещение от Пасхи")
    )
    title_ru = models.CharField(max_length=500, verbose_name=_("Название"))
    short_title_ru = models.CharField(max_length=100, blank=True, verbose_name=_("Краткое название"))

    icon = models.ImageField(upload_to='saints_icons/', blank=True, null=True, verbose_name=_("Икона"))
    icon_url = models.URLField(blank=True, null=True, verbose_name=_("URL иконы"))

    troparion_title = models.CharField(max_length=500, blank=True, verbose_name=_("Тропарь - название"))
    troparion_content = models.TextField(blank=True, verbose_name=_("Тропарь - текст"))
    troparion_echo = models.IntegerField(null=True, blank=True, verbose_name=_("Тропарь - глас"))
    kontakion_title = models.CharField(max_length=500, blank=True, verbose_name=_("Кондак - название"))
    kontakion_content = models.TextField(blank=True, verbose_name=_("Кондак - текст"))
    kontakion_echo = models.IntegerField(null=True, blank=True, verbose_name=_("Кондак - глас"))

    life_title = models.CharField(max_length=500, blank=True, verbose_name=_("Житие - заголовок"))
    life_content = models.TextField(blank=True, verbose_name=_("Житие - текст"))

    description = models.CharField(max_length=200, blank=True, verbose_name=_("Пояснение"))
    order = models.IntegerField(default=0, verbose_name=_("Порядок"))

    # ========== Дублирующие поля для украинского перевода ==========
    title_uk = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_("Название (укр.)")
    )

    short_title_uk = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Краткое название (укр.)")
    )

    troparion_title_uk = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_("Тропарь - название (укр.)")
    )

    troparion_content_uk = models.TextField(
        blank=True,
        verbose_name=_("Тропарь - текст (укр.)")
    )

    kontakion_title_uk = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_("Кондак - название (укр.)")
    )

    kontakion_content_uk = models.TextField(
        blank=True,
        verbose_name=_("Кондак - текст (укр.)")
    )

    life_title_uk = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_("Житие - заголовок (укр.)")
    )

    life_content_uk = models.TextField(
        blank=True,
        verbose_name=_("Житие - текст (укр.)")
    )

    description_uk = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_("Пояснение (укр.)")
    )

    class Meta:
        verbose_name = _("Дата празднования")
        verbose_name_plural = _("Даты празднования")
        ordering = ['order', 'month', 'day']
        unique_together = ['feast', 'month', 'day']

    def __str__(self):
        rank_display = f" [{self.get_celebration_rank_display()}]" if self.celebration_rank else ""

        # Если это подвижный праздник (easter_offset не None) — не показываем дату
        if self.easter_offset is not None:
            date_str = f"Пасха+{self.easter_offset}"
        elif self.month and self.day:
            date_str = f"{self.month:02d}.{self.day:02d}"
        else:
            date_str = "—"

        return f"{self.feast.search_name} — {self.title_ru} ({date_str}){rank_display}"

    def get_gregorian_date(self):
        from datetime import date, timedelta
        julian_date = date(2000, self.month, self.day)
        return julian_date + timedelta(days=13)


class FastType(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name=_("Код"))
    title_ru = models.CharField(max_length=200, verbose_name=_("Название (рус.)"))

    title_uk = models.CharField(max_length=200, blank=True, verbose_name=_("Название (укр.)"))

    class Meta:
        verbose_name = _("Тип поста")
        verbose_name_plural = _("Типы постов")

    def __str__(self):
        return self.title_ru


class Fast(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name=_("Код"))
    title_ru = models.CharField(max_length=200, verbose_name=_("Название (рус.)"))
    order = models.IntegerField(default=0, verbose_name=_("Порядок"))

    title_uk = models.CharField(max_length=200, blank=True, verbose_name=_("Название (укр.)"))

    start_month = models.IntegerField(null=True, blank=True, verbose_name=_("Начало - месяц"))
    start_day = models.IntegerField(null=True, blank=True, verbose_name=_("Начало - день"))
    start_easter_offset = models.IntegerField(null=True, blank=True, verbose_name=_("Начало - от Пасхи"))

    end_month = models.IntegerField(null=True, blank=True, verbose_name=_("Окончание - месяц"))
    end_day = models.IntegerField(null=True, blank=True, verbose_name=_("Окончание - день"))
    end_easter_offset = models.IntegerField(null=True, blank=True, verbose_name=_("Окончание - от Пасхи"))

    schedule_json = models.JSONField(default=dict, verbose_name=_("Расписание"))

    class Meta:
        verbose_name = _("Пост")
        verbose_name_plural = _("Посты")
        ordering = ['order', 'title_ru']

    def __str__(self):
        return self.title_ru


class DayInfo(models.Model):
    date_gregorian = models.DateField(unique=True, verbose_name=_("Дата (новый стиль)"))
    
    julian_month = models.IntegerField(verbose_name=_("Месяц (старый стиль)"))
    julian_day = models.IntegerField(verbose_name=_("День (старый стиль)"))

    feasts = models.ManyToManyField(Feast, related_name='days', blank=True, verbose_name=_("Праздники (старое)"))
    feast_dates = models.ManyToManyField(FeastDate, related_name='days', blank=True, verbose_name=_("Праздники"))

    main_feast = models.ForeignKey(
        FeastDate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='main_for_days',
        verbose_name=_("Главный святой дня")
    )

    fast_type = models.ForeignKey(FastType, null=True, on_delete=models.SET_NULL, verbose_name=_("Тип поста"))
    fast_name = models.CharField(max_length=200, blank=True, verbose_name=_("Название поста"))

    gospel_reading = models.TextField(blank=True, verbose_name=_("Евангельское чтение"))
    apostolic_reading = models.TextField(blank=True, verbose_name=_("Апостольское чтение"))

    summary = models.CharField(max_length=500, blank=True, verbose_name=_("Краткое описание (полное)"))
    short_summary = models.CharField(max_length=200, blank=True, verbose_name=_("Краткое описание (для календаря)"))

    summary_uk = models.CharField(max_length=500, blank=True, verbose_name=_("Краткое описание (полное, укр.)"))
    short_summary_uk = models.CharField(max_length=200, blank=True, verbose_name=_("Краткое описание (для календаря, укр.)"))
    fast_name_uk = models.CharField(max_length=200, blank=True, verbose_name=_("Название поста (укр.)"))
    gospel_reading_uk = models.TextField(blank=True, verbose_name=_("Евангельское чтение (укр.)"))
    apostolic_reading_uk = models.TextField(blank=True, verbose_name=_("Апостольское чтение (укр.)"))

    class Meta:
        verbose_name = _("День")
        verbose_name_plural = _("Дни")
        ordering = ['date_gregorian']
        indexes = [
            models.Index(fields=['date_gregorian']),
        ]

    def __str__(self):
        return f"{self.date_gregorian} (юл: {self.julian_month:02d}-{self.julian_day:02d})"
