import './Button.scss'
import clsx from "clsx";
import Icon from "@/components/Icon";
import { forwardRef } from "react";
import { Link } from "react-router-dom";

const Button = forwardRef((props, ref) => {
  const {
    className,
    type = 'button',
    href,
    to,
    target,
    mode = '',
    label,
    isLabelHidden = false,
    iconName,
    iconPosition = 'before',
    isLink = false,
    onClick,
    children,
    iconClassName,
    ...restProps

  } = props

  const isRouterLink = to !== undefined
  const isExternalLink = href !== undefined

  let Component = 'button'
  let specificProps = { type }

  if (isRouterLink) {
    Component = Link
    specificProps = { to }
  } else if (isExternalLink) {
    Component = 'a'
    specificProps = { href, target }
  }

  const title = isLabelHidden ? label : undefined
  const ariaLabel = label || title
  const iconComponent = iconName && <Icon
    iconClassName={iconClassName}
    name={iconName}
  />

  return (
    <Component
      ref={ref}
      className={clsx(className, 'button', {
        [`button--${mode}`]: mode,
        'button--link': isLink,
      })}
      title={title}
      aria-label={title}
      onClick={onClick}
      {...specificProps}
      {...restProps}
    >
      {children || (
        <>
          {iconPosition === 'before' && iconComponent}

          {!isLabelHidden && (
            <span className="button__label">{label}</span>
          )}

          {iconPosition === 'after' && iconComponent}
        </>
      )}
    </Component>
  )
})

export default Button