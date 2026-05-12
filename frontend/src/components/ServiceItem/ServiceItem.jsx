import './ServiceItem.scss'
import clsx from "clsx";
import Button from "@/components/Button";

const ServiceItem = (props) => {
  const {
    className,
    imgSrc,
    title,
    description,
    btnTitle,
    subtitle,
    linkTo,
  } = props

  const iconName = "arrow-right"

  return (
    <div
      className={clsx(className, 'service-item')}
    >
      <div className="service-item__body">
        <div className="service-item__image-wrapper">
          <img
            className="service-item__image"
            src={imgSrc}
            alt={title}
            width="64"
            height="64"
            loading="lazy"
          />
        </div>
        <div className="service-item__header">
          <h3 className="service-item__title">{title}</h3>
          <div className="service-item__description">
            <p>{description}</p>
          </div>
        </div>
        <Button
          to={linkTo}
          className="service-item__button"
          label={btnTitle}
        />
        <Button
          to={linkTo}
          className="service-item__link"
          iconName={iconName}
          iconPosition="after"
          label={subtitle}
          isLink={true}
        />
      </div>
    </div>
  )
}

export default ServiceItem