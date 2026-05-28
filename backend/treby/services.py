import base64
import hashlib
import json
import logging
from decimal import Decimal

from django.conf import settings

from rest_framework.exceptions import ValidationError

from schedule.models import Schedule

logger = logging.getLogger(__name__)


class LiqPay:
    def __init__(self, public_key, private_key):
        self.public_key = public_key
        self.private_key = private_key

        self.checkout_url = (
            "https://www.liqpay.ua/api/3/checkout"
        )

    def make_signature(self, data: str) -> str:
        sign_string = (
            f"{self.private_key}"
            f"{data}"
            f"{self.private_key}"
        )

        return base64.b64encode(
            hashlib.sha1(
                sign_string.encode("utf-8")
            ).digest()
        ).decode("utf-8")


class LiqPayService:
    def __init__(self):
        self.client = LiqPay(
            settings.LIQPAY_PUBLIC_KEY,
            settings.LIQPAY_PRIVATE_KEY,
        )

    def generate_payment_data(self, order):
        params = {
            "public_key": settings.LIQPAY_PUBLIC_KEY,
            "action": "pay",
            "amount": str(order.amount),
            "currency": "UAH",
            "description": f"Записка: {order.treba_type.full_name}",
            "order_id": str(order.uuid),
            "version": "3",
            "language": "uk",
            "result_url": settings.LIQPAY_RESULT_URL,
            "server_url": settings.LIQPAY_SERVER_URL,
            "sandbox": "1" if settings.LIQPAY_SANDBOX else "0",
        }

        json_data = json.dumps(
            params,
            ensure_ascii=False,
            sort_keys=True,
        )

        data = base64.b64encode(
            json_data.encode("utf-8")
        ).decode("utf-8")

        signature = self.client.make_signature(data)

        return {
            "data": data,
            "signature": signature,
            "action_url": self.client.checkout_url,
        }

    def validate_callback(self, data, signature):
        expected_signature = (
            self.client.make_signature(data)
        )

        if expected_signature != signature:
            return None

        try:
            decoded_data = (
                base64.b64decode(data)
                .decode("utf-8")
            )

            return json.loads(decoded_data)

        except Exception as error:
            logger.exception(
                f"LiqPay callback decode error: {error}"
            )

            return None


liqpay_service = LiqPayService()


def validate_schedule(date, treba_type):
    schedule = Schedule.objects.filter(
        date=date,
        is_active=True
    ).first()

    if not schedule:
        raise ValidationError(
            "На выбранную дату нет Богослужений"
        )

    service_type_ids = schedule.services.values_list(
        "type_id",
        flat=True
    )

    allowed = treba_type.service_types.filter(
        id__in=service_type_ids
    ).exists()

    if not allowed:
        raise ValidationError(
            "На выбранную дату нет такой требы"
        )

    return schedule


def calculate_amount(treba_type, names):
    if treba_type.price_type == "fixed":
        return treba_type.price

    return Decimal(
        len(names)
    ) * treba_type.price
