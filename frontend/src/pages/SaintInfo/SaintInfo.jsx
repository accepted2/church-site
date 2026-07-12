import './SaintInfo.scss'
import clsx from "clsx";

const SaintInfo = (props) => {
  const {
    className,
  } = props

  return (
    <div
      className={clsx(className, 'saint-info')}
    >
      SaintInfo
    </div>
  )
}

export default SaintInfo