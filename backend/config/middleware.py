from django.utils import translation


class ForceLanguageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        lang = request.GET.get('language')
        if lang:
            translation.activate(lang)
            request.LANGUAGE_CODE = lang
        return self.get_response(request)
