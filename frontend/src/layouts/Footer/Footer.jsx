import './Footer.scss'
import clsx from "clsx";

const Footer = (props) => {
  const {
    className,
  } = props

  return (
    <div
      className={clsx(className, 'footer')}
    >
      Footer
    </div>
  )
}

export default Footer