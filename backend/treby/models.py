import uuid

from django.db import models
from django.utils.text import slugify

from schedule.models import (
    Schedule,
    ServiceType,
)


class TrebaCategory(models.Model):
    name = models.CharField(
        max_length=255
    )

    slug = models.SlugField(
        unique=True,
        blank=True,
        db_index=True,
    )

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(
                self.name,
                allow_unicode=True,
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class TrebaVariant(models.Model):
    name = models.CharField(
        max_length=255
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class TrebaType(models.Model):
    class PriceType(models.TextChoices):
        FIXED = "fixed", "Фиксированная"
        PER_NAME = "per_name", "За имя"

    category = models.ForeignKey(
        TrebaCategory,
        on_delete=models.CASCADE,
        related_name="types"
    )

    variant = models.ForeignKey(
        TrebaVariant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="types"
    )

    service_types = models.ManyToManyField(
        ServiceType,
        related_name="treba_types",
        blank=True
    )

    price_type = models.CharField(
        max_length=20,
        choices=PriceType.choices
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )
    requires_schedule = models.BooleanField(default=True)

    class Meta:
        ordering = ["id"]

    @property
    def full_name(self):
        if self.variant:
            return (
                f"{self.category.name} "
                f"({self.variant.name})"
            )

        return self.category.name

    def __str__(self):
        return self.full_name


class TrebaOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Ожидает оплату"
        PAID = "paid", "Оплачено"
        CANCELED = "canceled", "Отменено"

    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )

    treba_type = models.ForeignKey(
        TrebaType,
        on_delete=models.PROTECT,
        related_name="orders"
    )

    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.PROTECT,
        related_name="treba_orders",
        null=True,
        blank=True,
    )

    names = models.JSONField(
        default=list
    )

    customer_name = models.CharField(
        max_length=255,
        blank=True
    )

    customer_phone = models.CharField(
        max_length=50,
        blank=True
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.treba_type.full_name} "
            f"({self.uuid})"
        )
