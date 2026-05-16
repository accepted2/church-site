import './AccordionItem.scss'
import clsx from "clsx";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

const AccordionItem = (props) => {
  const {
    className,
    title,
    isActive,
    onToggle,
    children,
    iconName = 'arrow-straight-right',
  } = props

  return (
    <div
      className={clsx(className, 'accordion-item')}
    >
      <Button
        className={clsx(className, 'accordion-item__trigger',
          isActive && 'is-active'
        )}
        onClick={onToggle}
        aria-expanded={isActive}
      >
        <span className="accordion-item__label">
          {title}
        </span>

        <Icon
          className='accordion-item__icon'
          name={iconName}
        />
      </Button>

      <div className={clsx('accordion-item__content', isActive && 'accordion-item__content--open')}>
        <div className="accordion-item__content-inner">
          {children}
        </div>
      </div>
    </div>
  )
}


export default AccordionItem