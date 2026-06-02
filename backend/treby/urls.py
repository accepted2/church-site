from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import (
    TrebaTypeViewSet,
    TrebaOrderViewSet,
    liqpay_callback, TrebaOrderByUUIDView,
)

router = DefaultRouter()

router.register(
    "types",
    TrebaTypeViewSet,
    basename="treba-types"
)

router.register(
    "orders",
    TrebaOrderViewSet,
    basename="treba-orders"
)

urlpatterns = [
    path("", include(router.urls)),
    path("liqpay-callback/", liqpay_callback, name="liqpay-callback"),
    path("orders/by-uuid/<uuid:uuid>/", TrebaOrderByUUIDView.as_view(), name="order-by-uuid"),
]
