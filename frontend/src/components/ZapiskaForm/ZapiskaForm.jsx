import './ZapiskaForm.scss'
import { getTrebaTypes, createTrebaOrder } from "@/utils/services/ZapiskaService";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import ZapiskaServiceCard from "@/components/ZapiskaServiceCard";
import Button from "@/components/Button";
import candle from "@/assets/icons/candle.svg"
import cross2 from "@/assets/icons/cross2.svg"
import heart from "@/assets/icons/heart.svg"
import church from "@/assets/icons/church.svg"
import groupCandles from "@/assets/icons/group-candles.svg"
import { IMaskInput } from 'react-imask';
import CustomSelect from "@/components/CustomSelect";


const ZapiskaForm = (props) => {
  const {
    className,
    defaultTypeId = null,
  } = props

  const { t, i18n } = useTranslation();
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
  const [isMobile, setIsMobile] = useState(false)

  const translateCategory = (categoryName) => {
    if (!categoryName) return categoryName;
    return t(`categories.${categoryName}`, { defaultValue: categoryName });
  };

  const translateVariant = (variantName) => {
    if (!variantName) return variantName;
    return t(`variants.${variantName}`, { defaultValue: variantName });
  };

  const translateFullName = (fullName, categoryName, variantName) => {
    if (!fullName) return fullName;

    // Парсим full_name: "О здравии (простая)" или "Панихида"
    const translatedCategory = translateCategory(categoryName);

    if (variantName) {
      const translatedVariant = translateVariant(variantName);
      return `${translatedCategory} (${translatedVariant})`;
    }

    return translatedCategory;
  };

  const calculatedTotal = useMemo(() => {
    if (!selectedType) return 0
    const type = serviceTypes.find(type => type.id === selectedType)
    if (!type) return 0
    if (type.price_type === 'fixed' && names.length !== 0) return type.price
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, []);

  const getOptionText = (type) => {
    const categoryName = type.category?.name
    const variantName = type.variant?.name
    if (variantName) {
      return `${translateCategory(categoryName)} - ${translateVariant(variantName)}`
    }
    return translateCategory(categoryName)
  }

  const options = serviceTypes.map((type) => ({
    value: type.id,
    label: `${getOptionText(type)} - ${type.price} ₴`
  }))

  const groupedTypes = useMemo(() => {
    const groups = {}
    serviceTypes.forEach(type => {
      const categoryName = type.category?.name
      if (!categoryName) return

      const translatedCategory = translateCategory(categoryName)

      if (!groups[translatedCategory]) {
        groups[translatedCategory] = {
          title: translatedCategory,
          originalTitle: categoryName,
          icon: categoryIcons[categoryName],
          variants: []
        }
      }
      let variantName = type.variant?.name || type.full_name
      if (categoryName === 'Сорокоуст') {
        variantName = type.variant?.name || (type.id === 9 ? 'о здравии' : "о упокоении")
      }
      if (variantName) {
        variantName = translateVariant(variantName)
      }
      groups[translatedCategory].variants.push({
        id: type.id,
        name: variantName,
        price: type.price
      })
    })

    const order = ['О здравии', 'О упокоении', 'Сорокоуст', 'Молебен', 'Панихида']

    return Object.values(groups).sort((a, b) => {
      const indexA = order.indexOf(a.originalTitle)
      const indexB = order.indexOf(b.originalTitle)
      return indexA - indexB
    })
  }, [serviceTypes, i18n.language])

  return (
    <div
      className={clsx(className, 'zapiska-form')}
      id="zapiska-form"
    >
      <div className="zapiska-form__grid">
        <div className="zapiska-form__fields">
          <div className="form-block">
            <h2 className="form-block__title">{t('zapiska_form.step1')}</h2>
            {isMobile ? (
              <CustomSelect
                options={options}
                value={selectedType}
                onChange={setSelectedType}
                placeholder={t('zapiska_form.select_type')}
              />
            ) : (
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
            )}
          </div>

          <div className="form-block">
            <h2 className="form-block__title">{t('zapiska_form.step2')}</h2>
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="form-hint">{t('zapiska_form.date_hint')}</p>
          </div>

          <div className="form-block">
            <h2 className="form-block__title">{t('zapiska_form.step3')}</h2>
            <div className="names-input">
              <input
                type="text"
                value={currentName}
                onChange={(event) => setCurrentName(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && (() => {
                  if (currentName.trim()) {
                    setNames([...names, currentName.trim()])
                    setCurrentName('')
                  }
                })()}
                placeholder={t('zapiska_form.name_placeholder')}
              />
              <Button
                className="names-input__button"
                label={t('zapiska_form.add_name')}
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
                <p className="names-list__empty">{t('zapiska_form.names_empty')}</p>
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
            <h2 className="form-block__title">{t('zapiska_form.step4')}</h2>
            <textarea
              className="notes-input"
              value={additionalInfo}
              onChange={(event) => setAdditionalInfo(event.target.value)}
              placeholder={t('zapiska_form.notes_placeholder')}
              rows={4}
            />
          </div>
        </div>

        <div className="zapiska-form__summary">
          <div className="order-summary">
            <h2 className="order-summary__title">{t('zapiska_form.summary_title')}</h2>

            <div className="order-summary__row">
              <span className="order-summary__subtitle">{t('zapiska_form.service_type')}</span>
              <span className={`order-summary__data ${!selectedType ? 'order-summary__data--empty' : ''}`}>
        {selectedType ? (() => {
          const type = serviceTypes.find(t => t.id === selectedType);
          if (!type) return t('zapiska_form.not_selected');

          const translatedCategory = translateCategory(type.category?.name);
          const translatedVariant = type.variant?.name ? translateVariant(type.variant.name) : null;

          if (translatedVariant) {
            return `${translatedCategory} (${translatedVariant})`;
          }
          return translatedCategory;
        })() : t('zapiska_form.not_selected')}
      </span>
            </div>

            <div className="order-summary__row">
              <span className="order-summary__subtitle">{t('zapiska_form.price')}</span>
              {selectedType ? (
                (() => {
                  const type = serviceTypes.find(t => t.id === selectedType);
                  if (!type) return <span className="order-summary__data">—</span>;
                  if (type.price_type === 'fixed') {
                    return <span className="order-summary__data">{type.price} {t('zapiska_form.per_note')}</span>;
                  } else {
                    return <span className="order-summary__data">{type.price} {t('zapiska_form.per_name')}</span>
                  }
                })()
              ) : (
                <span className="order-summary__data order-summary__data--empty">{t('zapiska_form.select_type_first')}</span>
              )}
            </div>

            <div className="order-summary__row">
              <span className="order-summary__subtitle">{t('zapiska_form.date')}</span>
              <span className={`order-summary__data ${!selectedDate ? "order-summary__data--empty" : ""}`}>
        {selectedDate || t('zapiska_form.not_selected')}
      </span>
            </div>

            <div className="order-summary__row">
              <span className="order-summary__subtitle">{t('zapiska_form.names_count')}</span>
              <span className={`order-summary__data ${names.length === 0 ? "order-summary__data--empty" : ""}`}>
        {names.length}
      </span>
            </div>

            <div className="order-summary__total">
              <span className="order-summary__total-label">{t('zapiska_form.total')}: </span>
              {calculatedTotal} ₴
            </div>

            <input
              type="text"
              className="summary-input"
              placeholder={t('zapiska_form.your_name')}
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
            />

            <IMaskInput
              mask="+38 000 000 00 00"
              value={userPhone}
              onAccept={(value) => setUserPhone(value)}
              placeholder={t('zapiska_form.phone')}
              className="summary-input"
            />

            <input
              type="email"
              className="summary-input"
              placeholder={t('zapiska_form.email')}
              value={userEmail}
              onChange={(event) => setUserEmail(event.target.value)}
            />

            <Button
              className="zapiska-form__submit-button"
              label={submitting ? t('zapiska_form.waiting') : t('zapiska_form.submit')}
              iconName="arrow-right"
              iconPosition="after"
              onClick={async () => {
                if (!selectedType) {
                  alert(t('zapiska_form.select_type_alert'))
                  return
                }
                if (!selectedDate) {
                  alert(t('zapiska_form.select_date_alert'))
                  return
                }
                if (names.length === 0) {
                  alert(t('zapiska_form.add_names_alert'))
                  return
                }
                if (!userName.trim()) {
                  alert(t('zapiska_form.enter_name_alert'))
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
                    alert(t('zapiska_form.payment_error'))
                  }
                } catch (error) {
                  alert(t('zapiska_form.error_prefix') + error.message)
                } finally {
                  setSubmitting(false)
                }
              }}
              disabled={submitting}
            />

            <p className="security-note">{t('zapiska_form.security_note')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZapiskaForm