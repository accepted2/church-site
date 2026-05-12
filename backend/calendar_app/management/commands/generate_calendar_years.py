# calendar_app/management/commands/generate_calendar_years.py
from django.core.management.base import BaseCommand
from calendar_app.importers import OrthodoxCalendarImporter
from calendar_app.models import DayInfo
from datetime import date
import time


class Command(BaseCommand):
    help = 'Generate calendar data for multiple years'

    def add_arguments(self, parser):
        parser.add_argument(
            '--start-year',
            type=int,
            required=True,
            help='Start year (e.g., 2024)'
        )
        parser.add_argument(
            '--end-year',
            type=int,
            required=True,
            help='End year (e.g., 2030)'
        )
        parser.add_argument(
            '--xml-path',
            type=str,
            default='data/orthodox-calendar',
            help='Path to orthodox-calendar directory'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force regenerate even if data exists'
        )

    def handle(self, *args, **options):
        start_year = options['start_year']
        end_year = options['end_year']
        xml_path = options['xml_path']
        force = options['force']

        self.stdout.write('=' * 60)
        self.stdout.write(f'Генерация календаря с {start_year} по {end_year} год')
        self.stdout.write('=' * 60)

        # Создаем импортер
        importer = OrthodoxCalendarImporter(xml_path)

        # Импортируем праздники и посты (только один раз)
        self.stdout.write('\n Импорт праздников и постов...')
        importer.import_fasts()
        importer.import_feasts()
        importer.import_movable_feasts()
        self.stdout.write(self.style.SUCCESS('✓ Праздники и посты импортированы'))

        # Генерируем дни для каждого года
        total_days = 0
        start_time = time.time()

        for year in range(start_year, end_year + 1):
            self.stdout.write(f'\n Год {year}...')

            # Проверяем, есть ли уже данные за этот год
            existing_days = DayInfo.objects.filter(date_gregorian__year=year).count()

            if existing_days > 0 and not force:
                self.stdout.write(f'   ⚠ Данные за {year} уже существуют ({existing_days} дней)')
                self.stdout.write(f'   Используйте --force для перегенерации')
                continue

            # Удаляем старые данные если force=True
            if force and existing_days > 0:
                deleted = DayInfo.objects.filter(date_gregorian__year=year).delete()
                self.stdout.write(f'   🗑 Удалено {deleted[0]} старых записей')

            # Генерируем новый год
            importer.generate_day_info(year)

            # Подсчитываем созданные дни
            days_count = DayInfo.objects.filter(date_gregorian__year=year).count()
            total_days += days_count
            self.stdout.write(self.style.SUCCESS(f'    Сгенерировано {days_count} дней'))

        elapsed_time = time.time() - start_time

        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS(
            f' Готово! Сгенерировано {total_days} дней за {elapsed_time:.1f} секунд'
        ))
        self.stdout.write(f' Период: {start_year} - {end_year}')
        self.stdout.write('=' * 60)
