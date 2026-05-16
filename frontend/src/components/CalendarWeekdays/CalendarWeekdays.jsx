import './CalendarWeekdays.scss'

import clsx from "clsx";

const CalendarWeekdays = (props) => {
  const {
    className,
  } = props

  const weekdays = [
    'Пн',
    'Вт',
    'Ср',
    'Чт',
    'Пт',
    'Сб',
    'Вс'
  ]

  return (
    <div
      className={clsx(
        className,
        'calendar-weekdays'
      )}
    >

      {weekdays.map(day => (

        <div
          key={day}
          className="calendar-weekdays__day"
        >
          {day}
        </div>

      ))}

    </div>
  )
}

export default CalendarWeekdays