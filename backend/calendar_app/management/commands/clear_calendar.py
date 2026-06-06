# calendar_app/management/commands/clear_calendar.py
from django.core.management.base import BaseCommand
from calendar_app.models import Feast, FeastDate, Fast, FastType, DayInfo


class Command(BaseCommand):
    help = 'Очищает только данные календаря (не трогает treby и schedule)'

    def handle(self, *args, **options):
        self.stdout.write("=" * 50)
        self.stdout.write("Очистка данных календаря...")
        self.stdout.write("=" * 50)

        # 1. Удаляем дни
        days_count, _ = DayInfo.objects.all().delete()
        self.stdout.write(f"🗑️ Удалено DayInfo: {days_count}")

        # 2. Удаляем даты праздников
        feast_dates_count, _ = FeastDate.objects.all().delete()
        self.stdout.write(f"🗑️ Удалено FeastDate: {feast_dates_count}")

        # 3. Удаляем праздники
        feasts_count, _ = Feast.objects.all().delete()
        self.stdout.write(f"🗑️ Удалено Feast: {feasts_count}")

        # 4. Удаляем посты
        fasts_count, _ = Fast.objects.all().delete()
        self.stdout.write(f"🗑️ Удалено Fast: {fasts_count}")

        # 5. Удаляем типы постов
        fast_types_count, _ = FastType.objects.all().delete()
        self.stdout.write(f"🗑️ Удалено FastType: {fast_types_count}")

        self.stdout.write("=" * 50)
        self.stdout.write(self.style.SUCCESS("✅ Календарь полностью очищен!"))

        self.stdout.write("=" * 50)
