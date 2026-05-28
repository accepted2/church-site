import logging
from decimal import Decimal, InvalidOperation

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from rest_framework import mixins, viewsets

from .models import TrebaType, TrebaOrder

from .serializers import (
    TrebaTypeSerializer,
    TrebaOrderSerializer,
    TrebaOrderCreateSerializer,
)

from .services import liqpay_service

logger = logging.getLogger(__name__)


class TrebaTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TrebaType.objects.filter(
        is_active=True
    )

    serializer_class = TrebaTypeSerializer


class TrebaOrderViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TrebaOrder.objects.select_related(
        "treba_type",
        "schedule",
    )

    def get_serializer_class(self):
        if self.action == "create":
            return TrebaOrderCreateSerializer

        return TrebaOrderSerializer


@csrf_exempt
@require_POST
def liqpay_callback(request):
    data = request.POST.get("data")
    signature = request.POST.get("signature")

    if not data or not signature:
        logger.warning("LiqPay callback missing data/signature")

        return JsonResponse(
            {"status": "error"},
            status=400
        )

    callback_data = liqpay_service.validate_callback(
        data,
        signature
    )

    if not callback_data:
        logger.warning("Invalid LiqPay signature")

        return JsonResponse(
            {"status": "error"},
            status=400
        )

    order_uuid = callback_data.get("order_id")

    payment_status = callback_data.get("status")

    payment_id = callback_data.get("payment_id")

    currency = callback_data.get("currency")

    try:
        amount = Decimal(
            callback_data.get("amount")
        )

    except (InvalidOperation, TypeError):
        logger.warning("Invalid payment amount")

        return JsonResponse(
            {"status": "error"},
            status=400
        )

    try:
        order = TrebaOrder.objects.get(
            uuid=order_uuid
        )

    except TrebaOrder.DoesNotExist:
        logger.warning(
            f"Order not found: {order_uuid}"
        )

        return JsonResponse(
            {"status": "error"},
            status=404
        )

    if order.status == TrebaOrder.Status.PAID:
        logger.info(
            f"Order already paid: {order.uuid}"
        )

        return JsonResponse(
            {"status": "ok"}
        )

    if amount != order.amount:
        logger.warning(
            f"Amount mismatch for order {order.uuid}"
        )

        return JsonResponse(
            {"status": "error"},
            status=400
        )

    if currency != "UAH":
        logger.warning(
            f"Currency mismatch for order {order.uuid}"
        )

        return JsonResponse(
            {"status": "error"},
            status=400
        )

    if payment_status in ["success", "sandbox"]:

        order.status = TrebaOrder.Status.PAID
        order.payment_id = payment_id
        order.paid_at = timezone.now()

        order.save(
            update_fields=[
                "status",
                "payment_id",
                "paid_at",
            ]
        )

        logger.info(
            f"Order paid successfully: {order.uuid}"
        )

    elif payment_status in ["failure", "error"]:

        order.status = TrebaOrder.Status.CANCELED

        order.save(
            update_fields=["status"]
        )

        logger.warning(
            f"Payment failed: {order.uuid}"
        )

    return JsonResponse({"status": "ok"})
