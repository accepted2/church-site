import './CalendarSection.scss'
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import api from '@/api';

import CalendarWeekdays from "@/components/CalendarWeekdays";
import CalendarGrid from "@/components/CalendarGrid";
import DayInfoPanel from "@/components/DayInfoPanel";
import CalendarHeader from "@/components/CalendarHeader";
import { getDaysInMonth } from "@/utils/calendar/getDaysInMonth";
import { getFormatedDay } from "@/utils/services/getFormatedDay";
import calendarImage from '@/assets/images/calendar_image.png'
import candleImage from '@/assets/images/candle_img 1.jpg'
import { useNavigate } from "react-router-dom";

const CalendarSection = ({ className }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate()

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
        const response = await api.get('/calendar/day/');
        setTodayData(response.data)
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
  }, [i18n.language])

  useEffect(() => {
    const fetchMonthData = async () => {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      try {
        setLoading(true)
        const response = await api.get(`/calendar/month/?year=${year}&month=${month}`);
        setMonthData(response.data);
        setVisibleDate(currentDate)
      } catch (error) {
        console.log('Ошибка загрузки календаря', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMonthData()
  }, [currentDate, i18n.language])

  useEffect(() => {
    if (!monthData?.days || selectedDay) return

    const todayString = new Date().toISOString().split('T')[0]
    const found = monthData.days.find(day => day.date_gregorian === todayString)

    if (found) setSelectedDay(found)
  }, [monthData, selectedDay])

  useEffect(() => {
    if (selectedDay && monthData?.days) {
      const updatedDay = monthData.days.find(
        day => day.date_gregorian === selectedDay.date_gregorian
      )
      if (updatedDay) {
        setSelectedDay(updatedDay)
      }
    }
  }, [monthData, i18n.language])

  useEffect(() => {
    if (!calendarRef.current) return

    const observer = new ResizeObserver(([entry]) => {
      setCalendarHeight(calendarRef.current.getBoundingClientRect().height)
    })
    observer.observe(calendarRef.current)
    return () => observer.disconnect()
  }, [])


  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }

  const handleMoreAboutDay = () => {
    if (selectedDay) {
      navigate(`/day/${selectedDay.date_gregorian}`)
    }
  }

  const days = getDaysInMonth(visibleDate.getFullYear(), visibleDate.getMonth())

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

    if (todayData.fast_type_code === 'no-fast') {
      return t('calendar.no_fast')
    }

    if (todayData.fast_type_code === 'fast' && todayData?.fast_name !== '') {
      return todayData.fast_name
    }

    if (todayData.fast_name && todayData.fast_type_code !== 'fast' && todayData.fast_type_code !== 'no-fast') {
      return `${todayData.fast_name} (${todayData.fast_type_title})`
    }

    if (todayData.fast_name) return todayData.fast_name
    return t('calendar.fast_day', { type: todayData.fast_type_title || '' })
  }

  return (
    <section
      className={clsx(className, 'calendar-section container')}
      id="calendar"
    >
      <div className="calendar-section__header">
        <div className="calendar-section__header-inner">
          <h2 className="calendar-section__title">{t('calendar.title')}</h2>
          <p className="calendar-section__subtitle">{t('calendar.subtitle')}</p>
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
              <h3 className="calendar-section__banner-label">{t('calendar.today')} {todayLabel}</h3>
              <div className="calendar-section__banner-info">
                <p className="calendar-section__banner-feast">
                  {todayData?.main_feast?.short_title || todayData?.main_feast?.title || t('calendar.no_feasts')}
                </p>
                <p className="calendar-section__banner-fast">{fastInfo()}</p>
              </div>
            </div>
          </div>
          <div className="calendar-section__banner-image-wrapper hidden-tablet-xs">
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
          className={clsx("calendar-section__calendar", { 'is-loading': loading })}
          ref={calendarRef}
        >
          <div className="calendar-section__calendar-inner">
            <CalendarHeader
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              currentDate={currentDate}
              iconPrevName="arrow-left"
              iconNextName="arrow-right"
            />
            <CalendarWeekdays />
            <CalendarGrid
              days={days}
              daysMap={daysMap}
              monthData={monthData}
              selectedDay={selectedDay}
              onDayClick={setSelectedDay}
              isHiddenDesktop
            />
          </div>
        </div>
        <DayInfoPanel
          selectedDay={selectedDay}
          style={{ '--calendar-height': `${calendarHeight}px` }}
          onMoreClick={handleMoreAboutDay}
        />
      </div>
    </section>
  )
}

export default CalendarSection