from django.contrib import admin
from django.utils.translation import gettext_lazy as _
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
        (_('Информация о заказе'), {
            'fields': ('uuid', 'treba_type', 'schedule', 'names', 'amount')
        }),
        (_('Данные подателя'), {
            'fields': ('customer_name', 'customer_phone', 'customer_email')
        }),
        (_('Дополнительно'), {
            'fields': ('additional_info',),
            'classes': ('wide',),
        }),
        (_('Оплата'), {
            'fields': ('payment_id', 'status', 'paid_at')
        }),
        (_('Дата создания'), {
            'fields': ('created_at',)
        }),
    )

    def uuid_short(self, obj):
        return str(obj.uuid)[:8] + '...'

    uuid_short.short_description = _('UUID')

    def treba_type_info(self, obj):
        return f"{obj.treba_type.full_name} ({obj.treba_type.price} ₴)"

    treba_type_info.short_description = _('Тип записки')

    def created_at_short(self, obj):
        return obj.created_at.strftime('%d.%m.%Y %H:%M')

    created_at_short.short_description = _('Создан')

    def paid_status(self, obj):
        if obj.status == 'paid':
            return _('✅ Оплачено')
        elif obj.status == 'pending':
            return _('⏳ Ожидает')
        return _('❌ Отменён')

    paid_status.short_description = _('Статус оплаты')
