from django.contrib import admin

# Register your models here.
from .models import MediaGallery


@admin.register(MediaGallery)
class MediaGalleryAdmin(admin.ModelAdmin):
    list_display = ['id', 'title_ru', 'media_type', 'order', 'is_active']
    list_filter = ['media_type', 'is_active']
    search_fields = ['title_ru', 'title_uk']
    list_editable = ['order', 'is_active']

    fieldsets = (
        ('Локализация', {
            'fields': ('title_ru', 'title_uk', 'description_ru', 'description_uk')
        }),
        ('Медиа', {
            'fields': ('media_type', 'image', 'video_file', 'video_thumbnail')
        }),
        ('Настройки', {
            'fields': ('order', 'is_active')
        }),
    )
