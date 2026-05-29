import './ZapiskaServiceCard.scss'
import clsx from "clsx";
import Button from "@/components/Button";

const ZapiskaServiceCard = (props) => {
  const {
    className,
    title,
    services = [],
    id,
    name,
    description,
    selectedId,
    onSelect
  } = props

  if (services.length === 0) return null


  return (
    <div
      className={clsx(className, 'zapiska-service-card')}
    >
      <div className="zapiska-service-card__header">

        {title && <h2 className="zapiska-service-card__title">{title}</h2>}
        {description && <p className="zapiska-service-card__description">{description}</p>}
      </div>

      <div className="zapiska-service-card__options">
        {services.map((service) => (
          <Button
            key={service.id}
            mode="service"
            className={clsx('zapiska-service-card__option', {
              'active': selectedId === service.id
            })}
            onClick={() => onSelect(service.id)}

          >
            <span className="zapiska-service-card__option-name">{service.name}</span>
            {/*<span className="zapiska-service-card__option-price">{service.price}</span>*/}
          </Button>
        ))}
      </div>

    </div>
  )
}

export default ZapiskaServiceCard