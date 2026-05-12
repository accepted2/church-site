from django.db import models


# Create your models here.
class News(models.Model):
    title = models.CharField(max_length=255)
    preview = models.TextField(blank=True)
    content = models.TextField()
    image = models.ImageField(upload_to='news/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title
