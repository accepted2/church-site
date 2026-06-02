import './ZapiskaForm.scss'
import { getTrebaTypes, createTrebaOrder } from "@/utils/services/ZapiskaService";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import ZapiskaServiceCard from "@/components/ZapiskaServiceCard";
import Button from "@/components/Button";
import candle from "@/assets/icons/candle.svg"
import cross2 from "@/assets/icons/cross2.svg"
import heart from "@/assets/icons/heart.svg"
import church from "@/assets/icons/church.svg"
import groupCandles from "@/assets/icons/group-candles.svg"
import { IMaskInput } from 'react-imask';


const ZapiskaForm = (props) => {
  const {
    className,
    defaultTypeId = null,
  } = props

  const [serviceTypes, setServiceTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState(defaultTypeId)
  const [selectedDate, setSelectedDate] = useState('')
  const [names, setNames] = useState([])
  const [currentName, setCurrentName] = useState('')
  const [userName, setUserName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [additionalInfo, setAdditionalInfo] = useState('')

  const calculatedTotal = useMemo(() => {
    if (!selectedType) {
      return 0
    }
    const type = serviceTypes.find(type => type.id === selectedType)
    if (!type) {
      return 0
    }
    if (type.price_type === 'fixed' && names.length !== 0) {
      return type.price
    }
    return type.price * names.length
  }, [selectedType, serviceTypes, names])

  const categoryIcons = {
    "О здравии": heart,
    "О упокоении": cross2,
    "Панихида": candle,
    "Молебен": church,
    "Сорокоуст": groupCandles,

  }

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const data = await getTrebaTypes()
        setServiceTypes(data)
      } catch (error) {
        console.log('Error', error)

      } finally {
        setLoading(false)
      }
    }
    loadTypes()
  }, []);

  const groupedTypes = useMemo(() => {
    const groups = {}

    serviceTypes.forEach(type => {
      const categoryName = type.category?.name
      if (!categoryName) {
        return
      }
      if (!groups[categoryName]) {
        groups[categoryName] = {
          title: categoryName,
          icon: categoryIcons[categoryName],
          variants: []
        }
      }
      let variantName = type.variant?.name || type.full_name
      if (categoryName === 'Сорокоуст') {
        variantName = type.variant?.name || (type.id === 9 ? 'о здравии' : "о упокоении")
      }

      groups[categoryName].variants.push({
        id: type.id,
        name: variantName,
        price: type.price
      })
    })
    return Object.values(groups)
  }, [serviceTypes])

  return (
    <div
      className={clsx(className, 'zapiska-form')}
      id="zapiska-form"
    >
      <div className="zapiska-form__grid">
        <div className="zapiska-form__fields">
          <div className="form-block">
            <h2 className="form-block__title">1. Выберите тип записки</h2>
            <div className="zapiska-form__cards-grid">
              {groupedTypes.map((group, index) => (
                <ZapiskaServiceCard
                  key={index}
                  title={group.title}
                  icon={group.icon}
                  services={group.variants}
                  selectedId={selectedType}
                  onSelect={setSelectedType}
                />
              ))}
            </div>
          </div>

          <div className="form-block">
            <h2 className="form-block__title">2. Выберете дату подачи</h2>
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}

              min={new Date().toISOString().split('T')[0]}
            />
            <p className="form-hint">Записка буде подана на вказану дату</p>
          </div>

          <div className="form-block">
            <h2 className="form-block__title">3. Введіть імена</h2>
            <div className="names-input">
              <input
                type="text"
                value={currentName}
                onChange={(event) => setCurrentName(event.target.value)}
                onKeyPress={(event) => event.key === 'Enter' && (() => {
                  if (currentName.trim()) {
                    setNames([...names, currentName.trim()])
                    setCurrentName('')
                  }
                })()}
                placeholder="Введите имя"

              />
              <Button
                className="names-input__button"
                label=" + Добавить имя"
                onClick={() => {
                  if (currentName.trim()) {
                    setNames([...names, currentName.trim()])
                    setCurrentName('')
                  }
                }}
              />


            </div>

            <div className={`names-list ${names.length > 0 ? 'names-list--has-items' : ''}`}>
              {names.length === 0 ? (
                <p className="names-list__empty">Список имен пока пуст</p>
              ) : (
                names.map((name, index) => (
                  <div
                    key={index}
                    className="names-list__item"
                  >
                    <span>{name}</span>
                    <Button
                      className="names-list__delete-icon"
                      iconName="cross-icon"
                      iconClassName="delete-icon"
                      onClick={() => setNames(names.filter((_, i) => i !== index))}
                    />

                  </div>
                ))
              )}
            </div>
          </div>

          <div className="form-block">
            <h2 className="form-block__title">Дополнительно (необязательно)</h2>
            <textarea
              className="notes-input"
              value={additionalInfo}
              onChange={(event) => setAdditionalInfo(event.target.value)}
              placeholder="Ваши пожелания или примечания"
              rows={4}
            />
          </div>
        </div>

        <div className="zapiska-form__summary">
          <div className="order-summary">
            <h2 className="order-summary__title">
              Общая информация
            </h2>

            <div className="order-summary__row">
              <span className="order-summary__subtitle">Тип записки</span>
              <span className={`order-summary__data ${!selectedType ? 'order-summary__data--empty' : ''}`}>
                {serviceTypes.find(type => type.id === selectedType)?.full_name || 'Не выбрано'}
              </span>

            </div>
            <div className="order-summary__row">
              <span className="order-summary__subtitle">Цена</span>
              {selectedType ? (
                (() => {
                  const type = serviceTypes.find(t => t.id === selectedType);
                  if (!type) return <span className="order-summary__data">—</span>;

                  if (type.price_type === 'fixed') {
                    return <span className="order-summary__data">{type.price} грн (за записку)</span>;
                  } else {
                    const total = type.price * names.length;

                    return (
                      <span className="order-summary__data">
            {type.price} грн (за имя)
          </span>)
                  }

                })()
              ) : (
                <span className="order-summary__data order-summary__data--empty">
      Выберите тип записки
    </span>
              )}
            </div>
            <div className="order-summary__row">
              <span className="order-summary__subtitle">Даты подачи</span>
              <span className={`order-summary__data ${!selectedDate ? "order-summary__data--empty" : ""}`}>{selectedDate || 'Не выбрано'}</span>
            </div>

            <div className="order-summary__row">
              <span className="order-summary__subtitle">Количество имен</span>
              <span className={`order-summary__data ${names.length === 0 ? "order-summary__data--empty" : ""}`}>{names.length}</span>
            </div>

            <div className="order-summary__total">
              <span className="order-summary__total-label">Итого к оплатe: </span>
              {calculatedTotal} грн
            </div>

            <input
              type="text"
              className="summary-input"
              placeholder="Ваше имя *"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}

            />
            <IMaskInput
              mask="+38 000 000 00 00"
              value={userPhone}
              onAccept={(value) => setUserPhone(value)}
              placeholder="+38 0XX XXX XX XX"
              className="summary-input"
            />

            <input
              type="email"
              className="summary-input"
              placeholder="Email (не обязательно)"
              value={userEmail}
              onChange={(event) => setUserEmail(event.target.value)}
            />

            <Button
              className="zapiska-form__submit-button"
              label={submitting ? "Зачекайте..." : "Перейти до оплати"}
              iconName="arrow-right"
              iconPosition="after"
              onClick={async () => {
                if (!selectedType) {
                  alert('Выберите тип записки')
                  return
                }
                if (!selectedDate) {
                  alert('Выберите дату')
                  return
                }
                if (names.length === 0) {
                  alert('Добавьте хотя бы одно имя')
                  return
                }
                if (!userName.trim()) {
                  alert('Введите ваше имя')
                  return
                }
                setSubmitting(true)

                try {
                  const response = await createTrebaOrder({
                    treba_type: selectedType,
                    date: selectedDate,
                    names: names,
                    customer_name: userName,
                    customer_phone: userPhone,
                    customer_email: userEmail,
                    additional_info: additionalInfo,
                  })

                  if (response.payment?.action_url) {
                    const form = document.createElement('form')
                    form.method = 'POST'
                    form.action = response.payment.action_url
                    form.target = '_blank'

                    const dataInput = document.createElement('input')
                    dataInput.type = 'hidden'
                    dataInput.name = 'data'
                    dataInput.value = response.payment.data
                    form.appendChild(dataInput)

                    const signatureInput = document.createElement('input')
                    signatureInput.type = 'hidden'
                    signatureInput.name = 'signature'
                    signatureInput.value = response.payment.signature
                    form.appendChild(signatureInput)

                    document.body.appendChild(form)
                    form.submit()
                  } else {
                    alert('Ошибка создания платежа')
                  }
                } catch (error) {
                  alert('Ошибка: ' + error.message)
                } finally {
                  setSubmitting(false)
                }

              }}
              disabled={submitting}
            />

            <p className="security-note">Ваши данные защищены</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZapiskaForm