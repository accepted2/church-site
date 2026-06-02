from django.contrib import admin
from .models import TrebaCategory, TrebaVariant, TrebaType, TrebaOrder


@admin.register(TrebaCategory)
class TrebaCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    list_display_links = ('name',)
    search_fields = ('name',)


@admin.register(TrebaVariant)
class TrebaVariantAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    list_display_links = ('name',)
    search_fields = ('name',)


@admin.register(TrebaType)
class TrebaTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'price', 'price_type', 'is_active')
    list_display_links = ('full_name',)
    list_filter = ('is_active', 'price_type', 'category')
    search_fields = ('category__name', 'variant__name')


@admin.register(TrebaOrder)
class TrebaOrderAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'uuid_short',
        'customer_name',
        'customer_phone',
        'treba_type_info',
        'amount',
        'status',
        'created_at_short',
        'paid_status',
    )
    list_display_links = ('customer_name',)
    list_filter = ('status', 'created_at', 'treba_type__category')
    search_fields = ('customer_name', 'customer_phone', 'uuid', 'names')
    readonly_fields = ('uuid', 'created_at', 'paid_at', 'payment_id')

    fieldsets = (
        ('Информация о заказе', {
            'fields': ('uuid', 'treba_type', 'schedule', 'names', 'amount')
        }),
        ('Данные подателя', {
            'fields': ('customer_name', 'customer_phone', 'customer_email')
        }),
        ('Дополнительно', {  # ← добавить эту секцию
            'fields': ('additional_info',),
            'classes': ('wide',),
        }),
        ('Оплата', {
            'fields': ('payment_id', 'status', 'paid_at')
        }),
        ('Дата создания', {
            'fields': ('created_at',)
        }),
    )

    def uuid_short(self, obj):
        return str(obj.uuid)[:8] + '...'

    uuid_short.short_description = 'UUID'

    def treba_type_info(self, obj):
        return f"{obj.treba_type.full_name} ({obj.treba_type.price} ₴)"

    treba_type_info.short_description = 'Тип записки'

    def created_at_short(self, obj):
        return obj.created_at.strftime('%d.%m.%Y %H:%M')

    created_at_short.short_description = 'Создан'

    def paid_status(self, obj):
        if obj.status == 'paid':
            return '✅ Оплачено'
        elif obj.status == 'pending':
            return '⏳ Ожидает'
        return '❌ Отменён'

    paid_status.short_description = 'Статус оплаты'
