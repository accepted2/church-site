from rest_framework.routers import DefaultRouter
from .views import MediaGalleryViewSet

router = DefaultRouter()
router.register('media', MediaGalleryViewSet, basename='gallery')

urlpatterns = router.urls
