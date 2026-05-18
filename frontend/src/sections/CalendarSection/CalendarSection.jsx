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
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [todayData, setTodayData] = useState(null)
  const [visibleDate, setVisibleDate] = useState(currentDate)
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
    const now = new Date()
    const night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
    const msUntilMidnight = night.getTime() - now.getTime()

    const timeout = setTimeout(() => {
      fetchTodayData()
      setInterval(fetchTodayData, 24 * 60 * 60 * 1000)
    }, msUntilMidnight)

    return () => clearTimeout(timeout)
  }, [])


  useEffect(() => {

    const fetchMonthData = async () => {

      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      try {
        setLoading(true)
        const response = await fetch(
          `http://localhost:8000/api/calendar/month/?year=${year}&month=${month}`
        )

        const data = await response.json()

        setMonthData(data)
        setVisibleDate(currentDate)

      } catch (error) {
        console.log('Ошибка загрузки календаря', error)

      } finally {

        setLoading(false)
      }
    }

    fetchMonthData()

  }, [currentDate])

  useEffect(() => {

    if (!monthData?.days || selectedDay) {
      return
    }

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
    if (!calendarRef.current) {
      return
    }

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
    visibleDate.getFullYear(),
    visibleDate.getMonth()
  )

  const daysMap = useMemo(() => {
    if (!monthData?.days) {
      return {}
    }
    return monthData.days.reduce((acc, day) => {
      acc[day.date_gregorian] = day

      return acc
    }, {})

  }, [monthData])

  const fastInfo = () => {
    if (!todayData) return ''

    // 1. нет поста — всегда приоритет
    if (todayData.fast_type_code === 'no-fast') {
      return 'Поста нет'
    }

    if (todayData.fast_type_code === 'fast' && todayData?.fast_name !== '') {
      return todayData?.fast_name
    }

    if (todayData.fast_name && (todayData.fast_type_code !== 'fast' && todayData.fast_type_code !== 'no-fast')) {
      return `${todayData.fast_name}  (${todayData.fast_type_title})`
    }

    // 2. если есть конкретное название поста — показываем только его
    if (todayData.fast_name) {
      return `${todayData.fast_name} `
    }

    // 3. fallback на тип поста
    return `Постный день (${todayData.fast_type_title})`
  }
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
                  {fastInfo()}

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
          className={clsx(
            "calendar-section__calendar",
            {
              'is-loading': loading
            }
          )}
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
              daysMap={daysMap}
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