import './ZapiskaServiceCard.scss'
import clsx from "clsx";
import { useTranslation } from 'react-i18next';
import Button from "@/components/Button";
import { useEffect, useState } from "react";

const ZapiskaServiceCard = (props) => {
  const {
    className,
    title,
    icon,
    services = [],
    description,
    selectedId,
    onSelect
  } = props

  const { t } = useTranslation();

  if (services.length === 0) return null;

  return (
    <div className={clsx(className, 'zapiska-service-card')}>
      <div className="zapiska-service-card__icon-wrapper">
        <img
          className="zapiska-service-card__icon"
          src={icon}
          alt=""
          width=""
          height=""
          loading="lazy"
        />
      </div>
      <div className="zapiska-service-card__header">
        {title && <h2 className="zapiska-service-card__title">{title}</h2>}
        {description && <p className="zapiska-service-card__description">{description}</p>}
      </div>

      <div className="zapiska-service-card__options">
        {services.length === 1 ? (
          <Button
            mode="service"
            onClick={() => onSelect(services[0].id)}
            className={clsx('zapiska-service-card__option', {
              'active': selectedId === services[0].id
            })}
          >
            <span className="zapiska-service-card__option-name">{t('zapiska_service_card.order')}</span>
          </Button>
        ) : (
          services.map((service) => (
            <Button
              key={service.id}
              mode="service"
              className={clsx('zapiska-service-card__option', {
                'active': selectedId === service.id
              })}
              onClick={() => onSelect(service.id)}
            >
              <span className="zapiska-service-card__option-name">{service.name}</span>
            </Button>
          ))
        )}
      </div>
    </div>
  )
}

export default ZapiskaServiceCard