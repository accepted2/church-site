from django.db import models
from django.utils.translation import gettext_lazy as _

from cloudinary.models import CloudinaryField


# Create your models here.

class MediaGallery(models.Model):
    class MediaType(models.TextChoices):
        PHOTO = 'photo', _('Фото')
        VIDEO = 'video', _("Видео")

    title_ru = models.CharField(max_length=200, verbose_name="Название (ru)")
    title_uk = models.CharField(max_length=200, verbose_name="Название (uk)", blank=True)

    description_ru = models.TextField(verbose_name='Описание (ru)', blank=True)
    description_uk = models.TextField(verbose_name="Описание (uk)", blank=True)

    media_type = models.CharField(max_length=10, choices=MediaType.choices, db_index=True)

    image = models.ImageField(
        upload_to='gallery/photos/',
        blank=True,
        null=True,
        verbose_name=_("Фото")
    )
    video_file = CloudinaryField(
        resource_type='video',
        blank=True,
        null=True,
        verbose_name='Видео'
    )

    video_thumbnail = models.ImageField(
        upload_to='gallery/thumbnails/',
        blank=True,
        null=True,
        verbose_name=_("Превью видео")
    )

    order = models.IntegerField(default=0, db_index=True)

    is_active = models.BooleanField(default=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = _("Медиа галерея")
        verbose_name_plural = _("Медиа галерея")

    def __str__(self):
        return self.title_ru or f"{self.media_type} {self.id}"
