import xml.etree.ElementTree as ET
from pathlib import Path

from django.core.management.base import BaseCommand
from django.conf import settings
from calendar_app.models import FastRule


class Command(BaseCommand):
    help = "Import fasts"

    def handle(self, *args, **kwargs):
        file = Path(settings.BASE_DIR) / "data" / "orthodox-calendar" / "fasts-ru" / "fasts.xml"

        tree = ET.parse(file)
        root = tree.getroot()

        FastRule.objects.all().delete()

        count = 0

        for fast in root.findall(".//fast"):
            name = fast.findtext("title") or "Fast"

            start_month = int(fast.findtext("start/month"))
            start_day = int(fast.findtext("start/day"))

            end_month = int(fast.findtext("end/month"))
            end_day = int(fast.findtext("end/day"))

            FastRule.objects.create(
                name=name,
                start_month=start_month,
                start_day=start_day,
                end_month=end_month,
                end_day=end_day,
            )

            count += 1

        self.stdout.write(self.style.SUCCESS(f"Imported fasts: {count}"))
