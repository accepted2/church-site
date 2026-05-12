from django.core.serializers import serialize
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import News
from .serializers import NewsSerializer


# Create your views here.
@api_view(['GET'])
def get_news(request):
    news = News.objects.all().order_by('created_at')
    serializer = NewsSerializer(news, many=True)
    return Response(serializer.data)
