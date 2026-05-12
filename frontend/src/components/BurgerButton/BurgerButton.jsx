import './BurgerButton.scss'
import clsx from "clsx";

const BurgerButton = (props) => {
  const {
    className,
    onClick,
    isOpen,
  } = props

  return (
    <button
      className={clsx(className, 'burger-button', {
        "is-active": isOpen
      })}
      type="button"
      aria-label="Toggle menu"
      onClick={onClick}
    >
      <svg
        className="burger-button__svg"
        width="30"
        height="30"
        viewBox="0 0 100 100"
      >
        <path
          className="burger-button__line burger-button__line--1"
          d="M 20,29.000046 H 80.000231 ..."
        />
        <path
          className="burger-button__line burger-button__line--2"
          d="M 20,50 H 80"
        />
        <path
          className="burger-button__line burger-button__line--3"
          d="M 20,70.999954 H 80.000231 ..."
        />
      </svg>
    </button>
  )
}

export default BurgerButton