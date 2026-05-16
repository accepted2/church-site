import './CalendarHeader.scss'

import clsx from "clsx";

import Button from "@/components/Button";

const CalendarHeader = (props) => {
  const {
    className,
    onPrevMonth,
    onNextMonth,
    currentDate,
  } = props

  return (
    <div
      className={clsx(
        className,
        'calendar-header'
      )}
    >

      <Button
        className="calendar-header__button"
        iconName="arrow-left"
        onClick={onPrevMonth}
      />

      <h2 className="calendar-header__title">

        {currentDate.toLocaleString(
          'ru-RU',
          {
            month: 'long',
            year: 'numeric'
          }
        )}

      </h2>

      <Button
        className="calendar-header__button"
        iconName="arrow-right"
        onClick={onNextMonth}
      />

    </div>
  )
}

export default CalendarHeader