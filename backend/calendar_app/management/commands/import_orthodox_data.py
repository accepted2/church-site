from django.core.management.base import BaseCommand
from calendar_app.models import Feast, FastType, Fast, DayInfo
from calendar_app.importers import OrthodoxCalendarImporter


# Management command
class Command(BaseCommand):
    help = 'Import orthodox calendar data from XML files'

    def add_arguments(self, parser):
        parser.add_argument('--xml-path', type=str, required=True,
                            help='Path to orthodox-calendar directory')
        parser.add_argument('--year', type=int,
                            help='Year to generate day info for (default: current)')

    def handle(self, *args, **options):
        xml_path = options['xml_path']
        year = options.get('year')

        self.stdout.write(f'Starting import from {xml_path}...')

        importer = OrthodoxCalendarImporter(xml_path)
        importer.import_all()

        if year:
            importer.generate_day_info(year)
        else:
            importer.generate_day_info()

        self.stdout.write(self.style.SUCCESS(
            f'Successfully imported data for {year or "current"} year'
        ))
