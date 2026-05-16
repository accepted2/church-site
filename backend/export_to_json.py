# export_correct_json.py
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from calendar_app.models import Feast, FeastDate, Fast, FastType

print("=" * 50)
print("ЭКСПОРТ В ФОРМАТЕ DJANGO FIXTURE")
print("=" * 50)

result = []

# 1. Feast
for feast in Feast.objects.all():
    result.append({
        'model': 'calendar_app.feast',
        'pk': feast.id,
        'fields': {
            'feast_type': feast.feast_type,
            'external_id': feast.external_id,
            'search_name': feast.search_name,
        }
    })
print(f"✅ Feast: {len([x for x in result if x['model'] == 'calendar_app.feast'])}")

# 2. FeastDate
for fd in FeastDate.objects.all():
    result.append({
        'model': 'calendar_app.feastdate',
        'pk': fd.id,
        'fields': {
            'feast': fd.feast.id,
            'date_type': fd.date_type,
            'celebration_type': fd.celebration_type,
            'celebration_rank': fd.celebration_rank,
            'month': fd.month,
            'day': fd.day,
            'easter_offset': fd.easter_offset,
            'title_ru': fd.title_ru,
            'short_title_ru': fd.short_title_ru,
            'icon': fd.icon.name if fd.icon else '',
            'icon_url': fd.icon_url,
            'troparion_title': fd.troparion_title,
            'troparion_content': fd.troparion_content,
            'troparion_echo': fd.troparion_echo,
            'kontakion_title': fd.kontakion_title,
            'kontakion_content': fd.kontakion_content,
            'kontakion_echo': fd.kontakion_echo,
            'life_title': fd.life_title,
            'life_content': fd.life_content,
            'description': fd.description,
            'order': fd.order,
        }
    })
print(f"✅ FeastDate: {len([x for x in result if x['model'] == 'calendar_app.feastdate'])}")

# 3. FastType
for ft in FastType.objects.all():
    result.append({
        'model': 'calendar_app.fasttype',
        'pk': ft.id,
        'fields': {
            'code': ft.code,
            'title_ru': ft.title_ru,
        }
    })
print(f"✅ FastType: {len([x for x in result if x['model'] == 'calendar_app.fasttype'])}")

# 4. Fast
for f in Fast.objects.all():
    result.append({
        'model': 'calendar_app.fast',
        'pk': f.id,
        'fields': {
            'code': f.code,
            'title_ru': f.title_ru,
            'order': f.order,
            'start_month': f.start_month,
            'start_day': f.start_day,
            'start_easter_offset': f.start_easter_offset,
            'end_month': f.end_month,
            'end_day': f.end_day,
            'end_easter_offset': f.end_easter_offset,
            'schedule_json': f.schedule_json,
        }
    })
print(f"✅ Fast: {len([x for x in result if x['model'] == 'calendar_app.fast'])}")

# Сохраняем
with open('django_fixture.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("=" * 50)
print("✅ Файл django_fixture.json создан!")
print("📌 Теперь используй: python manage.py loaddata django_fixture.json")
print("=" * 50)
