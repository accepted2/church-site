from rest_framework import serializers

from .models import (
    TrebaCategory,
    TrebaVariant,
    TrebaType,
    TrebaOrder,
)

from .services import (
    validate_schedule,
    calculate_amount,
    liqpay_service,
)


class TrebaVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrebaVariant
        fields = "__all__"


class TrebaCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrebaCategory
        fields = "__all__"


class TrebaTypeSerializer(serializers.ModelSerializer):
    category = TrebaCategorySerializer(
        read_only=True
    )

    variant = TrebaVariantSerializer(
        read_only=True
    )

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = TrebaType
        fields = "__all__"


class TrebaOrderCreateSerializer(
    serializers.ModelSerializer
):
    date = serializers.DateField(
        write_only=True,
        required=False,
        allow_null=True,
    )

    uuid = serializers.UUIDField(
        read_only=True
    )

    payment = serializers.SerializerMethodField()

    class Meta:
        model = TrebaOrder

        fields = [
            "id",
            "uuid",
            "treba_type",
            "date",
            "names",
            "customer_name",
            "customer_phone",
            "payment",
        ]

    def validate(self, attrs):
        treba_type = attrs["treba_type"]

        if not isinstance(attrs["names"], list):
            raise serializers.ValidationError({
                "names": "Список имен должен быть массивом"
            })
        
        names = [
            name.strip()
            for name in attrs["names"]
            if str(name).strip()
        ]
        attrs["names"] = names

        date = attrs.get("date")

        if not names:
            raise serializers.ValidationError(
                "Введите хотя бы одно имя"
            )

        if treba_type.requires_schedule:

            if not date:
                raise serializers.ValidationError({
                    "date": "Выберите дату службы"
                })

            schedule = validate_schedule(
                date,
                treba_type
            )
            attrs["schedule"] = schedule

        else:

            attrs["schedule"] = None

        return attrs

    def create(self, validated_data):
        validated_data.pop("date", None)

        amount = calculate_amount(
            validated_data["treba_type"],
            validated_data["names"],
        )

        validated_data["amount"] = amount

        return TrebaOrder.objects.create(
            **validated_data
        )

    def get_payment(self, obj):
        if obj.status == TrebaOrder.Status.PAID:
            return None

        return liqpay_service.generate_payment_data(
            obj
        )


class TrebaOrderSerializer(
    serializers.ModelSerializer
):
    treba_type = TrebaTypeSerializer(
        read_only=True
    )

    class Meta:
        model = TrebaOrder
        fields = "__all__"
