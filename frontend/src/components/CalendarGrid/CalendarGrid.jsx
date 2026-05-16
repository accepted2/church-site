import './CalendarGrid.scss'

import clsx from "clsx";
import { useMemo } from "react";

import CalendarDay from "@/components/CalendarDay";

const CalendarGrid = (props) => {
  const {
    className,
    days,
    monthData,
    onDayClick,
    selectedDay,
  } = props

  const daysMap = useMemo(() => {
    if (!monthData?.days) return {}

    return monthData.days.reduce((acc, day) => {
      acc[day.date_gregorian] = day
      return acc
    }, {})
  }, [monthData])

  const formatDate = (date) => {
    const year = date.getFullYear()

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0')

    const day = String(
      date.getDate()
    ).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  return (
    <div className="calendar-grid-wrapper">

      <div
        className={clsx(
          className,
          'calendar-grid'
        )}
      >

        {days.map((day, index) => {

          const apiDay = daysMap[formatDate(day.date)]
          console.log(apiDay)
          const mainFeast = apiDay?.main_feast
          const feastName = mainFeast?.short_title_ru || apiDay?.short_summary
          const isSunday = index % 7 === 6
          const isSaturday = index % 7 === 5

          return (
            <CalendarDay
              key={day.date.getTime()}
              dayNumber={day.dayNumber}

              feastName={feastName}
              isCurrentMonth={day.isCurrentMonth}
              isSunday={isSunday}
              isSaturday={isSaturday}
              isSelected={
                selectedDay?.date_gregorian ===
                apiDay?.date_gregorian
              }
              onClick={() =>
                apiDay && onDayClick(apiDay)
              }
            />
          )
        })}

      </div>

    </div>
  )
}

export default CalendarGrid