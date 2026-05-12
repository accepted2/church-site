import './ScheduleDay.scss'
import clsx from "clsx";
import ScheduleItem from "@/components/ScheduleItem";
import { getWeekday } from "@/utils/services/getWeekday";
import { getFormatedDay } from "@/utils/services/getFormatedDay";


const ScheduleDay = (props) => {
  const {
    className,
    day,
    isToday,
  } = props

  const weekday = getWeekday(day.date)
  const formatDate = getFormatedDay(day.date)

  return (
    <div
      className={clsx(className, 'schedule-day', {
        'schedule-day--today': isToday
      })}
    >
      <div className="schedule-day__header">
        <span className="schedule-day__weekday">
          {weekday}
        </span>
        <span className="schedule-day__date">
          {formatDate}
        </span>
      </div>

      <div className="schedule-day__services">
        {day.services?.map((service) => (
          <ScheduleItem
            key={service.id}
            service={service}
          />
        ))}
      </div>
    </div>
  )
}

export default ScheduleDay