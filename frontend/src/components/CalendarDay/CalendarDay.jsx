import './CalendarDay.scss'

import clsx from "clsx";
import Button from "@/components/Button";

const CalendarDay = (props) => {
  const {
    className,
    dayNumber,
    feastName,
    isCurrentMonth,
    isSelected,
    isSunday,
    isSaturday,
    onClick,
  } = props

  return (
    <Button
      className={clsx(
        className,
        'calendar-day',

        !isCurrentMonth &&
        'other-month',

        isSelected &&
        'is-selected',

        isSunday &&
        'is-sunday',
        isSaturday &&
        'is-saturday'
      )}
      onClick={onClick}
    >

      <span className="calendar-day__number">
        {dayNumber}
      </span>

      {feastName && (
        <span className="calendar-day__feast-name hidden-tablet">
          {feastName}
        </span>
      )}

    </Button>
  )
}

export default CalendarDay