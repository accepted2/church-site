from django.contrib import admin

from .models import (
    TrebaCategory,
    TrebaVariant,
    TrebaType,
    TrebaOrder
)

admin.site.register(TrebaCategory)
admin.site.register(TrebaVariant)
admin.site.register(TrebaType)
admin.site.register(TrebaOrder)
