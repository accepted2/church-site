# calendar_app/importers.py
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timedelta
from calendar_app.models import Feast, FastType, Fast, DayInfo


class OrthodoxCalendarImporter:
    def __init__(self, xml_root_path):
        self.xml_root = Path(xml_root_path)
        self.current_year = datetime.now().year

    def import_all(self):
        print("=" * 50)
        print("Starting import of orthodox calendar data...")
        print("=" * 50)

        self.import_fasts()
        self.import_feasts()
        self.import_movable_feasts()
        self.generate_day_info()

        print("=" * 50)
        print("Import completed successfully!")
        print("=" * 50)

    def import_movable_feasts(self):
        """Импорт подвижных праздников из feasts_movable.xml"""
        movable_file = self.xml_root / "typikon-feasts-ru/feasts_movable.xml"
        if not movable_file.exists():
            print(f"Warning: {movable_file} not found")
            return

        print("Importing movable feasts...")
        tree = ET.parse(movable_file)
        root = tree.getroot()

        for feast_elem in root.findall('.//feast'):
            date_elem = feast_elem.find('.//date/easter')
            if date_elem is not None:
                easter_offset = int(date_elem.get('days', '0'))

                feast, created = Feast.objects.get_or_create(
                    feast_type='movable',
                    easter_offset=easter_offset,
                    defaults={
                        'title_ru': self._get_text(feast_elem, './/title/ru'),
                        'external_id': feast_elem.get('id', ''),
                        'month': 0,
                        'day': 0,
                    }
                )
                self._parse_hymns(feast_elem, feast)
                feast.save()
                if created:
                    print(f"  Added: {feast.title_ru}")

    def _parse_hymns(self, elem, feast):
        """Парсинг гимнов для праздника"""
        for hymn in elem.findall('.//hymn'):
            hymn_type = hymn.get('type')
            echo = hymn.get('echo')
            title = self._get_text(hymn, 'title/ru')
            content = self._get_text(hymn, 'content/ru')

            if hymn_type == 'troparion':
                feast.troparion_title = title
                feast.troparion_content = content
                feast.troparion_echo = int(echo) if echo and echo.isdigit() else None
            elif hymn_type == 'kontakion':
                feast.kontakion_title = title
                feast.kontakion_content = content
                feast.kontakion_echo = int(echo) if echo and echo.isdigit() else None

    def import_feasts(self):
        """Импорт праздников из typikon-feasts-ru"""
        print("Importing feasts from typikon...")

        for month in range(1, 13):
            file_path = self.xml_root / f"typikon-feasts-ru/feasts_{month:02d}.xml"
            if not file_path.exists():
                continue

            tree = ET.parse(file_path)
            root = tree.getroot()

            for feast_elem in root.findall('.//feast'):
                self._parse_typikon_feast(feast_elem, month)

        print("Importing lives of saints...")
        for month in range(1, 13):
            month_dir = self.xml_root / f"lives-of-the-saints-ru/{month:02d}"
            if not month_dir.exists():
                continue

            for day_file in month_dir.glob("*.xml"):
                day = int(day_file.stem)
                tree = ET.parse(day_file)
                root = tree.getroot()

                for feast_elem in root.findall('.//feast'):
                    self._parse_lives_feast(feast_elem, month, day)

    def _parse_typikon_feast(self, elem, month):
        day = self._get_day_from_date(elem)
        title = self._get_text(elem, './/title/ru')

        if not title:
            return

        feast, created = Feast.objects.get_or_create(
            feast_type='typikon',
            month=month,
            day=day,
            defaults={
                'title_ru': title,
                'external_id': elem.get('id', ''),
            }
        )

        self._parse_hymns(elem, feast)
        feast.save()

        if created:
            print(f"  Added: {title} ({month:02d}-{day:02d})")

    def _parse_lives_feast(self, elem, month, day):
        title = self._get_text(elem, './/title/ru')

        if not title:
            return

        feast, created = Feast.objects.get_or_create(
            feast_type='lives',
            month=month,
            day=day,
            defaults={
                'title_ru': title,
                'external_id': elem.get('id', ''),
            }
        )

        # ПАРСИМ ЖИТИЕ - правильная структура
        life_parts = []

        # Ищем все content элементы
        for content_elem in elem.findall('.//content'):
            # Получаем заголовок (если есть)
            title_elem = content_elem.find('.//title')
            if title_elem is not None:
                # Текст может быть в <ru> или прямо в <title>
                title_text = self._get_text(title_elem, 'ru') or title_elem.text
                if title_text and title_text.strip():
                    life_parts.append(f"=== {title_text.strip()} ===\n")

            # Ищем текст в <text><ru><p>
            text_elem = content_elem.find('.//text')
            if text_elem is not None:
                # Ищем русский текст
                ru_elem = text_elem.find('.//ru')
                if ru_elem is not None:
                    # Собираем все параграфы
                    paragraphs = []
                    for p in ru_elem.findall('.//p'):
                        if p.text and p.text.strip():
                            paragraphs.append(p.text.strip())
                    if paragraphs:
                        life_parts.append('\n\n'.join(paragraphs))

        if life_parts:
            feast.life_content = '\n\n'.join(life_parts)
            print(f"  Loaded life text: {len(feast.life_content)} chars for {title}")
        else:
            # Альтернативный поиск: ищем любые p теги
            paragraphs = []
            for p in elem.findall('.//p'):
                if p.text and p.text.strip():
                    paragraphs.append(p.text.strip())
            if paragraphs:
                feast.life_content = '\n\n'.join(paragraphs)
                print(f"  Loaded life text (alt): {len(feast.life_content)} chars for {title}")

        self._parse_hymns(elem, feast)
        feast.save()

        if created:
            print(f"  Added life: {title} ({month:02d}-{day:02d})")

    def import_fasts(self):
        """Импорт постов"""
        fasts_xml = self.xml_root / "fasts-ru/fasts.xml"
        if not fasts_xml.exists():
            print(f"Warning: {fasts_xml} not found")
            return

        print("Importing fasts...")
        tree = ET.parse(fasts_xml)
        root = tree.getroot()

        for fast_type in root.findall('.//fastType'):
            obj, created = FastType.objects.get_or_create(
                code=fast_type.get('id'),
                defaults={'title_ru': self._get_text(fast_type, 'title/ru')}
            )
            if created:
                print(f"  Added fast type: {obj.title_ru}")

        for fast_elem in root.findall('.//fast'):
            fast, created = Fast.objects.get_or_create(
                code=fast_elem.get('id'),
                defaults={
                    'title_ru': self._get_text(fast_elem, 'title/ru'),
                    'order': int(fast_elem.get('order', 0)),
                }
            )

            start = fast_elem.find('start')
            if start is not None:
                julian = start.find('julian')
                easter = start.find('easter')
                if julian is not None and julian.text:
                    month, day = map(int, julian.text.split('-'))
                    fast.start_month, fast.start_day = month, day
                    fast.start_easter_offset = None
                elif easter is not None:
                    fast.start_month, fast.start_day = None, None
                    fast.start_easter_offset = int(easter.get('days', '0'))

            end = fast_elem.find('end')
            if end is not None:
                julian = end.find('julian')
                easter = end.find('easter')
                if julian is not None and julian.text:
                    month, day = map(int, julian.text.split('-'))
                    fast.end_month, fast.end_day = month, day
                    fast.end_easter_offset = None
                elif easter is not None:
                    fast.end_month, fast.end_day = None, None
                    fast.end_easter_offset = int(easter.get('days', '0'))

            schedule = {}
            for schedule_elem in fast_elem.findall('schedule'):
                for day_elem in schedule_elem.findall('day'):
                    weekday = day_elem.get('weekday')
                    fast_type_code = day_elem.get('fastType')
                    if weekday and fast_type_code:
                        schedule[weekday] = fast_type_code

            fast.schedule_json = schedule
            fast.save()

            if created:
                print(f"  Added fast: {fast.title_ru}")

    def generate_day_info(self, year=None):
        """Генерация информации для всех дней года"""
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

            feasts = Feast.objects.filter(
                feast_type__in=['typikon', 'lives'],
                month=julian_date.month,
                day=julian_date.day
            )

            movable_feasts = self._get_movable_feasts_for_date(current, easter_date)
            feasts = feasts | movable_feasts

            day_info.feasts.set(feasts)

            fast_info = self._get_fast_for_date(julian_date, current, easter_date, all_fasts)
            if fast_info:
                fast_type_obj = FastType.objects.filter(code=fast_info['type_code']).first()
                day_info.fast_type = fast_type_obj
                day_info.fast_name = fast_info.get('name', '')

            feast_titles = [f.title_ru for f in feasts[:3]]
            day_info.summary = '; '.join(feast_titles)

            day_info.save()

            day_count += 1
            if day_count % 100 == 0:
                print(f"  Processed {day_count} days...")

            current += timedelta(days=1)

        print(f"  Generated {day_count} days")

    def _get_movable_feasts_for_date(self, gregorian_date, easter_date):
        delta = (gregorian_date - easter_date).days
        return Feast.objects.filter(
            feast_type='movable',
            easter_offset=delta
        )

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

    def _get_text(self, elem, path):
        found = elem.find(path)
        return found.text.strip() if found is not None and found.text else ''

    def _get_day_from_date(self, elem):
        date_elem = elem.find('.//date/julian')
        if date_elem is not None and date_elem.text:
            parts = date_elem.text.split('-')
            if len(parts) == 2:
                return int(parts[1])
        return 1
