from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.translation import gettext_lazy as _


def send_payment_success_email(order):
    if order.customer_email:
        user_html = render_to_string('emails/user_payment_success.html', {'order': order})
        send_mail(
            subject=_('Ваша записка принята') + f' (#{order.uuid[:8]})',
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.customer_email],
            html_message=user_html,
            fail_silently=False,
        )

        admin_html = render_to_string('email/admin_new_order.html', {'order': order})
        send_mail(
            subject=_('Новая записка!') + f' {_("Записка")} №{order.uuid}',
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            html_message=admin_html,
            fail_silently=False,
        )
