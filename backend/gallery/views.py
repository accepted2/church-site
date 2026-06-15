from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MediaGallery
from .serializers import MediaGallerySerializer


class MediaGalleryViewSet(viewsets.ModelViewSet):
    queryset = MediaGallery.objects.filter(is_active=True)
    serializer_class = MediaGallerySerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        media_type = self.request.query_params.get('type', None)
        if media_type:
            queryset = queryset.filter(media_type=media_type)

        return queryset

    @action(detail=False, methods=['get'], url_path='by-type')
    def by_type(self, request):
        photos = self.get_queryset().filter(media_type='photo')
        videos = self.get_queryset().filter(media_type='video')

        return Response({
            'photos': MediaGallerySerializer(photos, many=True, context={'request': request}).data,
            'videos': MediaGallerySerializer(videos, many=True, context={'request': request}).data,
        })
