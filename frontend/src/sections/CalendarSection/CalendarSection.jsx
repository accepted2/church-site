import './CalendarSection.scss'
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";

import CalendarWeekdays from "@/components/CalendarWeekdays";
import CalendarGrid from "@/components/CalendarGrid";
import DayInfoPanel from "@/components/DayInfoPanel";
import CalendarHeader from "@/components/CalendarHeader";

import { getDaysInMonth } from "@/utils/calendar/getDaysInMonth";
import { getFormatedDay } from "@/utils/services/getFormatedDay";

import calendarImage from '@/assets/images/calendar_image.png'
import candleImage from '@/assets/images/candle_img 1.jpg'

const CalendarSection = ({ className }) => {

  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthData, setMonthData] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [todayData, setTodayData] = useState(null)

  const calendarRef = useRef(null)
  const [calendarHeight, setCalendarHeight] = useState(0)

  const todayLabel = getFormatedDay(new Date())

  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/calendar/day/')
        const data = await response.json()
        setTodayData(data)
      } catch (error) {
        console.log('Ошибка загрузки сегодняшнего дня', error)
      }
    }
    fetchTodayData()
  }, [])


  useEffect(() => {

    const fetchMonthData = async () => {

      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      try {

        const response = await fetch(
          `http://localhost:8000/api/calendar/month/?year=${year}&month=${month}`
        )

        const data = await response.json()

        setMonthData(data)

      } catch (error) {
        console.log('Ошибка загрузки календаря', error)
      }
    }

    fetchMonthData()

  }, [currentDate])

  useEffect(() => {

    if (!monthData?.days || selectedDay) return

    const todayString = new Date()
      .toISOString()
      .split('T')[0]

    const found = monthData.days.find(
      day => day.date_gregorian === todayString
    )

    if (found) {
      setSelectedDay(found)
    }

  }, [monthData, selectedDay])

  useEffect(() => {
    if (!calendarRef.current) return

    const observer = new ResizeObserver(([entry]) => {
      setCalendarHeight(calendarRef.current.getBoundingClientRect().height)
    })

    observer.observe(calendarRef.current)

    return () => observer.disconnect()
  }, [])


  const handlePrevMonth = () => {
    setCurrentDate(prev =>
      new Date(
        prev.getFullYear(),
        prev.getMonth() - 1
      )
    )
  }

  const handleNextMonth = () => {
    setCurrentDate(prev =>
      new Date(
        prev.getFullYear(),
        prev.getMonth() + 1
      )
    )
  }

  const days = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  )

  return (
    <section className={clsx(className, 'calendar-section container')}>

      <div className="calendar-section__header">

        <div className="calendar-section__header-inner">

          <h2 className="calendar-section__title">
            Православный календарь
          </h2>

          <p className="calendar-section__subtitle">
            Выберите день, чтобы посмотреть праздники и святых
          </p>

        </div>

        <div className="calendar-section__banner">

          <div className="calendar-section__banner-content">

            <div className="calendar-section__banner-icon-wrapper">
              <img
                className="calendar-section__banner-icon"
                src={calendarImage}
                alt=""
                width="36"
                height="36"
                loading="lazy"
              />
            </div>

            <div className="calendar-section__banner-body">

              <h3 className="calendar-section__banner-label">
                Сегодня {todayLabel}
              </h3>

              <div className="calendar-section__banner-info">

                <p className="calendar-section__banner-feast">
                  {
                    todayData?.main_feast?.short_title_ru
                    || 'Нет праздников'
                  }
                </p>

                <p className="calendar-section__banner-fast">

                  {todayData?.fast_name || 'Поста нет'}

                  {
                    todayData?.fast_type_title &&
                    ` (${todayData.fast_type_title})`
                  }

                </p>

              </div>

            </div>

          </div>

          <div className="calendar-section__banner-image-wrapper hidden-tablet-xs ">

            <img
              className="calendar-section__banner-image"
              src={candleImage}
              alt=""
              loading="lazy"
            />

          </div>

        </div>

      </div>
      <div className="calendar-section__body">
        <div
          className="calendar-section__calendar"
          ref={calendarRef}
        >
          <div className="calendar-section__calendar-inner">
            <CalendarHeader
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              currentDate={currentDate}
            />

            <CalendarWeekdays />

            <CalendarGrid
              days={days}
              monthData={monthData}
              onDayClick={setSelectedDay}
            />
          </div>
        </div>
        <DayInfoPanel
          selectedDay={selectedDay}
          style={{
            '--calendar-height': `${calendarHeight}px`
          }}
        />
      </div>


    </section>
  )
}

export default CalendarSection