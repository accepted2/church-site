# calendar_app/importers.py
from datetime import datetime, timedelta
from calendar_app.models import FeastDate, FastType, Fast, DayInfo


class OrthodoxCalendarImporter:
    def __init__(self, xml_root_path=None):
        """Инициализация импортера (XML больше не нужен)"""
        self.current_year = datetime.now().year

    def generate_day_info(self, year=None):
        """Генерация дней из FeastDate (без XML)"""
        if year is None:
            year = self.current_year

        print(f"Generating day info for year {year}...")
        easter_date = self._calculate_easter(year)
        print(f"  Easter date: {easter_date}")

        all_fasts = list(Fast.objects.all())
        start_date = datetime(year, 1, 1).date()
        end_date = datetime(year, 12, 31).date()
        current = start_date
        day_count = 0

        while current <= end_date:
            julian_date = self._gregorian_to_julian(current)

            day_info, created = DayInfo.objects.get_or_create(
                date_gregorian=current,
                defaults={
                    'julian_month': julian_date.month,
                    'julian_day': julian_date.day,
                }
            )

            feast_dates = FeastDate.objects.filter(
                month=julian_date.month,
                day=julian_date.day
            )

            movable_dates = FeastDate.objects.filter(
                easter_offset=(current - easter_date).days
            )
            feast_dates = feast_dates | movable_dates

            day_info.feast_dates.set(feast_dates)
            day_info.feasts.clear()

            fast_info = self._get_fast_for_date(julian_date, current, easter_date, all_fasts)
            if fast_info:
                fast_type_obj = FastType.objects.filter(code=fast_info['type_code']).first()
                day_info.fast_type = fast_type_obj
                day_info.fast_name = fast_info.get('name', '')

            feast_full_titles = [fd.title_ru for fd in feast_dates[:3]]
            feast_short_titles = [fd.short_title_ru or fd.title_ru for fd in feast_dates[:3]]

            day_info.summary = '; '.join(feast_full_titles)
            day_info.short_summary = '; '.join(feast_short_titles)

            day_info.save()
            day_count += 1

            if day_count % 100 == 0:
                print(f"  Processed {day_count} days...")

            current += timedelta(days=1)

        print(f"  Generated {day_count} days")

    def _gregorian_to_julian(self, gregorian_date):
        year = gregorian_date.year
        if year <= 1900:
            offset = 12
        elif year <= 2100:
            offset = 13
        else:
            offset = 14
        return gregorian_date - timedelta(days=offset)

    def _calculate_easter(self, year):
        a = year % 19
        b = year % 4
        c = year % 7
        d = (19 * a + 15) % 30
        e = (2 * b + 4 * c + 6 * d + 6) % 7
        day = d + e + 4
        if day > 30:
            return datetime(year, 5, day - 30).date()
        else:
            return datetime(year, 4, day).date()

    def _get_fast_for_date(self, julian_date, gregorian_date, easter_date, all_fasts):
        for fast in all_fasts:
            start_date = self._get_fast_boundary_date(fast, 'start', gregorian_date.year, easter_date)
            end_date = self._get_fast_boundary_date(fast, 'end', gregorian_date.year, easter_date)
            if start_date and end_date and start_date <= gregorian_date <= end_date:
                weekday_map = {0: 'mon', 1: 'tue', 2: 'wed', 3: 'thu', 4: 'fri', 5: 'sat', 6: 'sun'}
                weekday = weekday_map[gregorian_date.weekday()]
                fast_type_code = fast.schedule_json.get(weekday, 'no-fast')
                return {'type_code': fast_type_code, 'name': fast.title_ru}
        return None

    def _get_fast_boundary_date(self, fast, boundary, year, easter_date):
        if boundary == 'start':
            month_attr = 'start_month'
            day_attr = 'start_day'
            offset_attr = 'start_easter_offset'
        else:
            month_attr = 'end_month'
            day_attr = 'end_day'
            offset_attr = 'end_easter_offset'

        offset = getattr(fast, offset_attr)
        if offset is not None:
            return easter_date + timedelta(days=offset)

        month = getattr(fast, month_attr)
        day = getattr(fast, day_attr)
        if month and day:
            try:
                return datetime(year, month, day).date()
            except ValueError:
                return datetime(year, month, min(day, 28)).date()
        return None
