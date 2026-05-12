import './Logo.scss'
import clsx from "clsx";
import { Link } from "react-router-dom";

const Logo = (props) => {
  const {
    className,
    loading = "lazy",
  } = props
  const title = 'Home'

  return (
    <Link
      className={clsx(className, 'logo')}
      to="/"
      title={title}
      aria-label={title}
    >
      <img
        className="logo__image"
        src="/logo.svg"
        alt=""
        width={56}
        height={56}
        loading={loading}
      />
    </Link>
  )
}

export default Logo