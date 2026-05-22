import './Footer.scss'
import clsx from "clsx";

const Footer = (props) => {
  const {
    className,
  } = props

  return (
    <div
      className={clsx(className, 'footer')}
      id="contacts"
    >
      Footer
    </div>
  )
}

export default Footer