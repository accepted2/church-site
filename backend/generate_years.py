# generate_years.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from calendar_app.importers import OrthodoxCalendarImporter
from calendar_app.models import DayInfo

# Очищаем
DayInfo.objects.all().delete()
print("🗑️ Дни удалены")

# Генерируем
importer = OrthodoxCalendarImporter("data/orthodox-calendar")

for year in range(2025, 2031):
    importer.generate_day_info(year)
    print(f"✅ {year} год сгенерирован ({365 if year != 2028 else 366} дней)")

print(f"\n📅 Итого: {DayInfo.objects.count()} дней")
