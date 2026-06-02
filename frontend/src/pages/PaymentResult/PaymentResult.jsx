import './PaymentResult.scss'
import clsx from "clsx";
import { useSearchParams } from "react-router-dom";

import { useEffect, useState } from "react";
import { getTrebaOrderByUuid } from "@/utils/services/ZapiskaService";
import Button from "@/components/Button";
import { useMetaData } from "@/context/MetaDataContext";

const PaymentResult = (props) => {
  const {
    className,
  } = props

  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scheduleData, setScheduleData] = useState(null)

  const { setMetaData } = useMetaData()
  useEffect(() => {
    setMetaData({
      title: "Результат оплаты | Храм",
      isHeaderFixed: false,
      headerTheme: "payment",
    })
  }, [setMetaData]);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const orderId = searchParams.get('order_id')

      if (!orderId) {
        setError('Не указано ID заказа')
        setLoading(false)
        return
      }

      try {
        const response = await getTrebaOrderByUuid(orderId)
        setOrder(response)

        setScheduleData(response.schedule || null)

      } catch (error) {
        console.error('Error fetching order:', error)
        setError('Не удалось получить статус заказа')
      } finally {
        setLoading(false)
      }
    }
    checkPaymentStatus()
  }, [searchParams]);

  if (loading) {
    return (
      <div className="payment-result payment-result--loading">
        <div className="payment-result__spinner"></div>
        <p>Проверяем статус вашего заказа...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result payment-result--error">
        <div className="payment-result__icon">❌</div>
        <h1 className="payment-result__title">Ошибка</h1>
        <p className="payment-result__message">{error}</p>

        <Button
          to="/"
          label="На главную"
        />

      </div>
    );
  }

  const isPaid = order?.status === 'paid';
  const isPending = order?.status === 'pending';
  const isCanceled = order?.status === 'canceled';

  return (
    <div className={`payment-result payment-result--${order?.status || 'unknown'}`}>

      <div className="payment-result__header">
        <div className="payment-result__icon">
          {isPaid && '✅'}
          {isPending && '⏳'}
          {isCanceled && '❌'}
        </div>

        <h1 className="payment-result__title">
          {isPaid && 'Оплата прошла успешно!'}
          {isPending && 'Ожидаем оплату'}
          {isCanceled && 'Платеж отклонен'}
        </h1>
      </div>
      <div className="payment-result__status">
        {isPaid && (
          <p className="payment-result__message">
            Спаси Господи! Ваша записка принята.
            {scheduleData && (
              <> Будет подана на {new Date(scheduleData).toLocaleDateString("uk-UA")} </>
            )}
          </p>
        )}
        <p>
          {isPending && 'Ваша заказ ожидает оплату. Пожалуйста, завершите платеж.'}</p>
        <p> {isCanceled && 'Платеж был отменен. Попробуйте еще раз.'}</p>
      </div>

      {order && (
        <div className="payment-result__details">
          <div className="payment-result__detail">
            <span className="payment-result__detail-label">Номер заказа:</span>
            <span className="payment-result__detail-value">{order.uuid}</span>
          </div>
          <div className="payment-result__detail">
            <span className="payment-result__detail-label">Тип записки:</span>
            <span className="payment-result__detail-value">{order.treba_type?.full_name || '—'}</span>
          </div>
          <div className="payment-result__detail">
            <span className="payment-result__detail-label">Количество имен:</span>
            <span className="payment-result__detail-value">{order.names?.length || 0}</span>
          </div>
          <div className="payment-result__detail">
            <span className="payment-result__detail-label">Сумма:</span>
            <span className="payment-result__detail-value">{order.amount} грн.</span>
          </div>
        </div>
      )}

      <div className="payment-result__actions">

        <Button
          to="/"
          label="На главную"
          className="payment-result__button-back"
        />

        {isPending && (
          <Button
            label="Попробывать оплатить заново"
            mode="primary"
            onClick={() => window.location.reload()}
          />
        )}
      </div>
    </div>
  );
}

export default PaymentResult