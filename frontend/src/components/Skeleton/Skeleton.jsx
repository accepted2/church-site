import './Skeleton.scss'
import clsx from "clsx";

const Skeleton = (props) => {
  const {
    className,
    variant = 'text',
    style,
  } = props

  return (
    <div
      className={clsx(className, 'skeleton', `skeleton--${variant}`)}
      style={style}
    >

    </div>
  )
}

export default Skeleton