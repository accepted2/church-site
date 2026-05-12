import './ScheduleItem.scss'
import clsx from "clsx";

const ScheduleItem = (props) => {
  const {
    className,
    service,
  } = props

  return (
    <div
      className={clsx(className, 'schedule-item')}
    >
      <span className="schedule-item__time">
        {service.time}
      </span>
      <span className="schedule-item__title">
        {service.title}
      </span>
    </div>
  )
}

export default ScheduleItem