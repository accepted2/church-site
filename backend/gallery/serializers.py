from django.utils.translation import get_language
from rest_framework import serializers
from .models import MediaGallery


class MediaGallerySerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaGallery
        fields = [
            'id', 'media_type', 'title', 'description',
            'file_url', 'thumbnail_url', 'order'
        ]

    def _get_localized(self, obj, field_ru, field_uk):
        lang = get_language()
        if lang == 'uk' and getattr(obj, field_uk, None):
            return getattr(obj, field_uk)
        return getattr(obj, field_ru)

    def get_title(self, obj):
        return self._get_localized(obj, 'title_ru', 'title_uk')

    def get_description(self, obj):
        return self._get_localized(obj, 'description_ru', 'description_uk')

    def get_file_url(self, obj):
        request = self.context.get('request')

        if obj.media_type == 'photo' and obj.image:
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url

        if obj.media_type == 'video' and obj.video_file:
            url = obj.video_file.url
            return request.build_absolute_uri(url) if request else url

        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')

        if obj.video_thumbnail:
            url = obj.video_thumbnail.url
            return request.build_absolute_uri(url) if request else url

        return None
