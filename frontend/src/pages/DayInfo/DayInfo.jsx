import './DayInfo.scss'
import clsx from "clsx";
import { useMetaData } from "@/context/MetaDataContext";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "@/components/Button";
import CalendarGrid from "@/components/CalendarGrid";
import { getDaysInMonth } from "@/utils/calendar/getDaysInMonth";
import CalendarHeader from "@/components/CalendarHeader";
import CalendarWeekdays from "@/components/CalendarWeekdays";
import api from "@/api";
import ApostolicBookIcon from "@/assets/icons/apostolic-book-icon.png"
import GospelBookIcon from "@/assets/icons/gospel-book-icon.png"
import Expandable from "@/components/Expandable";
import Skeleton from "@/components/Skeleton";
import Icon from "@/components/Icon";

const DayInfo = (props) => {
  const { className } = props
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { date } = useParams()
  const { setMetaData } = useMetaData()

  const [currentDate, setCurrentDate] = useState(() => {
    if (date) {
      const [year, month, day] = date.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    return new Date()
  })

  const [monthData, setMonthData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayData, setDayData] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    life: false,
    troparion: false,
    kontakion: false,
    gospel: false,
    apostolic: false,
  })
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const openLightbox = (imageUrl, alt) => {
    setSelectedImage({ url: imageUrl, alt })
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setSelectedImage(null)
  }

  useEffect(() => {
    const fetchMonthData = async () => {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      try {
        setLoading(true)
        const response = await api.get(`/calendar/month/?year=${year}&month=${month}`)
        setMonthData(response.data)
      } catch (error) {
        console.error('Ошибка загрузки данных месяца', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMonthData()
  }, [currentDate])

  const fetchDayData = async (dateString) => {
    if (!dateString) return

    if (!dayData) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)

    try {
      const response = await api.get(`/calendar/day/?date=${dateString}`, {
        params: {
          lang: i18n.language,
        }
      })
      setDayData(response.data)
      setSelectedDay(response.data)
    } catch (error) {
      console.error('Ошибка загрузки данных дня', error)
      if (error.response?.status === 404) {
        setError(t('dayInfo.error.not_found'))
      } else {
        setError(t('dayInfo.error.load_error'))
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (date) {
      const urlParams = new URLSearchParams(location.search)
      const lang = urlParams.get('lang') || i18n.language

      fetchDayData(date)
      const [year, month, day] = date.split('-').map(Number)
      setCurrentDate(new Date(year, month - 1, day))
    }
  }, [date, location.search, i18n.language])

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
  }, [monthData])

  useEffect(() => {
    setMetaData({
      title: dayData ? `${dayData.date_str} | ${dayData.main_feast?.title || t('dayInfo.memory_day')}` : t('dayInfo.page_title'),
      isHeaderFixed: true,
    })
    window.scrollTo(0, 0)
  }, [location.pathname, dayData, t])

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }

  const handleDayClick = (day) => {
    if (day && day.date_gregorian) {
      navigate(`/dayinfo/${day.date_gregorian}?lang=${i18n.language}`)
    }
  }

  const days = useMemo(() => {
    return getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
  }, [currentDate])

  const daysMap = useMemo(() => {
    if (!monthData?.days) {
      return {}
    }
    return monthData.days.reduce((acc, day) => {
      acc[day.date_gregorian] = day
      return acc
    }, {})
  }, [monthData])

  if (loading && !dayData) {
    return (
      <div className="day-info container">
        <div className="day-info__skeleton">
          <div className="day-info__skeleton-header">
            <div className="skeleton skeleton-image" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" />
          </div>
          <div className="day-info__skeleton-body">
            <div className="skeleton skeleton-block" />
            <div className="skeleton skeleton-block" />
            <div className="skeleton skeleton-block" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !dayData) {
    return (
      <div className="day-info container">
        <div className="day-info__error">
          <p>{error}</p>
          <Button
            label={t('dayInfo.go_home')}
            to="/"
          />
        </div>
      </div>
    )
  }

  const mainFeast = dayData.main_feast || dayData.all_feasts[0]
  const allFeasts = dayData.all_feasts || []
  const dateStr = dayData.date_str
  const icons = dayData.main_feast?.icons || []
  const dateObj = new Date(dateStr)
  const formattedDate = !isNaN(dateObj)
    ? dateObj.toLocaleDateString(i18n.language === 'uk' ? 'uk-UA' : 'ru-RU', {
      day: 'numeric',
      month: "long",
      year: "numeric"
    })
    : dateStr

  const fastText = dayData.fast_name && dayData.fast_type_title
    ? `${dayData.fast_name} — ${dayData.fast_type_title}`
    : dayData.fast_name || dayData.fast_type_title

  const hasFast = Boolean(fastText)
  const otherFeasts = allFeasts.filter(f => f.id !== mainFeast?.id)
  const formatOldStyle = (gregorianDateStr) => {
    if (!gregorianDateStr) return null
    const date = new Date(gregorianDateStr)
    if (isNaN(date)) return null
    const julian = new Date(date)
    julian.setDate(date.getDate() - 13)

    const locale = i18n.language === 'uk' ? 'uk-UA' : "ru-RU"
    return julian.toLocaleDateString(locale, { day: 'numeric', month: 'long' })
  }
  const iconsAmount = icons.length

  return (
    <div className={clsx(className, 'day-info container')}>
      <div className="day-info__layout">
        <div className="day-info__sidebar">
          <div className={clsx("day-info__calendar", { 'is-loading': loading })}>
            <CalendarHeader
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              currentDate={currentDate}
              iconPrevName="arrow-straight-left"
              iconNextName="arrow-straight-right"
            />
            <CalendarWeekdays />
            <CalendarGrid
              days={days}
              daysMap={daysMap}
              monthData={monthData}
              selectedDay={selectedDay}
              onDayClick={handleDayClick}
              isHiddenDesktop
            />
          </div>

          <div className="day-info__feasts">
            <h4 className="day-info__feasts-title">{t('dayInfo.saints_of_day')}</h4>
            <ul className="day-info__feasts-list">
              {otherFeasts.length > 0 ? (
                otherFeasts.map((feast) => (
                  // <li
                  //   key={feast.id}
                  //   className="day-info__feasts-item"
                  // >
                  <Button
                    key={feast.id}
                    className="day-info__feasts-item"
                    isLink
                    to={`/saint/${feast.id}`}
                    draggable={false}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <img
                      className="day-info__feasts-icon"
                      src={feast.icon}
                      alt={feast.title}
                      loading="lazy"
                      draggable={false}
                    />
                    <span className="day-info__feasts-text">
      {feast.short_title || feast.title}
    </span>
                    <Icon
                      name="arrow-straight-right"
                      iconClassName="day-info__feasts-arrow"
                    />
                  </Button>
                  // </li>
                ))
              ) : (
                <li className="day-info__feast-item">{t('dayInfo.no_other_feasts')}</li>
              )}
            </ul>
          </div>
        </div>

        <div className={clsx("day-info__content", { 'is-refreshing': isRefreshing })}>
          <div className="day-info__top">
            <div className="day-info__header">
              <div className="day-info__images-wrapper ">
                {mainFeast?.icon && (
                  <img
                    className="day-info__image"
                    src={mainFeast.icon}
                    alt={mainFeast.short_title}
                    width="64"
                    height="64"
                    loading="lazy"
                    onClick={() => openLightbox(mainFeast.icon, mainFeast.short_title)}
                    style={{ cursor: 'zoom-in' }}
                    draggable={false}
                  />
                )}
                {iconsAmount <= 2 ? (
                  <div className="day-info__slider">
                    {icons.map((icon, index) => (
                      <img
                        key={index}
                        className="day-info__slider-image"
                        src={icon.image}
                        alt={mainFeast.short_title}
                        loading="lazy"
                        onClick={() => openLightbox(icon.image, mainFeast.short_title)}
                        style={{ cursor: 'zoom-in' }}
                        draggable={false}
                      />
                    ))}
                  </div>
                ) : ""}
              </div>
              <div className="day-info-main">
                <p className="day-info-main__date">{formattedDate}</p>
                <h2 className="day-info-main__title">{mainFeast?.title}</h2>
                <p className="day-info-main__fast">
                  {hasFast ? (
                    <span className="day-info-panel__fast">{fastText}</span>
                  ) : (
                    <span className="day-info-panel__fast no-fast">{t('calendar.no_fast')}</span>
                  )}
                </p>
                <div
                  className={clsx("day-info-main__memory",
                    mainFeast?.all_dates.length > 3 && "to-bottom"
                  )}
                >
                  <strong>{(mainFeast?.all_dates?.length ?? 0) === 1
                    ? t('calendar.day_of_memory')
                    : t('calendar.day_of_memory_plural')}
                    :
                  </strong>
                  {mainFeast?.all_dates && mainFeast.all_dates.length > 0 ? (
                    <ul className="day-info-main__dates-list">
                      {mainFeast.all_dates.map((date) => {
                        const isSameTitle = date.title === mainFeast.title
                        const oldStyleDate = formatOldStyle(date.gregorian_date)
                        return (
                          <li
                            key={date.id}
                            className="day-info-main__dates-item"
                          >
                            <span className="day-info__date">
                              {date.gregorian_date && new Date(date.gregorian_date).toLocaleDateString(i18n.language === 'uk' ? 'uk-UA' : 'ru-RU', {
                                day: 'numeric', month: 'long'
                              })}
                            </span>
                            {oldStyleDate && (
                              <>
                                ({t('dayInfo.old_style')} <span className="day-info__date">{oldStyleDate}</span>)
                              </>
                            )}
                            {!isSameTitle && (
                              <> — <span className="day-info__date-title">{date.title}</span>
                              </>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <span>{t('dayInfo.no_data')}</span>
                  )}
                </div>
              </div>
            </div>
            {iconsAmount >= 3 ? (
              <div className="day-info__slider">
                {icons.map((icon, index) => (
                  <img
                    key={index}
                    className="day-info__slider-image"
                    src={icon.image}
                    alt={mainFeast.short_title}
                    loading="lazy"
                    onClick={() => openLightbox(icon.image, mainFeast.short_title)}
                    style={{ cursor: 'pointer' }}
                    draggable={false}
                  />
                ))}
              </div>
            ) : ""}

          </div>

          <div className="day-info__about">
            {mainFeast?.life_content && (
              <div className="day-info__saint-life">
                <h3 className="day-info__title">{t('calendar.life_of_saint')}</h3>
                <Expandable
                  collapsedHeight={140}
                  buttonClassName="day-info__life-button"
                  expandedLabel={t('dayInfo.read_more')}
                  collapsedLabel={t('dayInfo.hide')}
                >
                  <p className="day-info__life-content">
                    {mainFeast.life_content}
                  </p>
                </Expandable>

              </div>
            )}

            <div className="day-info__chant">
              {mainFeast?.troparion_content && (
                <div className="day-info__troparion">
                  <h3 className="day-info__title">
                    {t('calendar.troparion')} {mainFeast.troparion_echo && `(${t('calendar.troparion_title', { echo: mainFeast.troparion_echo })})`}
                  </h3>
                  <Expandable
                    collapsedHeight={100}
                    buttonClassName="day-info__chunt-button"
                    expandedLabel={t('dayInfo.read_more')}
                    collapsedLabel={t('dayInfo.hide')}
                  >
                    <p className="day-info__troparion-content">
                      {mainFeast.troparion_content}
                    </p>
                  </Expandable>

                </div>
              )}

              {mainFeast?.kontakion_content && (
                <div className="day-info__kontakion">
                  <h3 className="day-info__title">
                    {t('calendar.kontakion')} {mainFeast.kontakion_echo && `(${t('calendar.kontakion_title', { echo: mainFeast.kontakion_echo })})`}
                  </h3>
                  <Expandable
                    collapsedHeight={100}
                    buttonClassName="day-info__chunt-button"
                    expandedLabel={t('dayInfo.read_more')}
                    collapsedLabel={t('dayInfo.hide')}
                  >
                    <p className="day-info__kontakion-content">
                      {mainFeast.kontakion_content}
                    </p>
                  </Expandable>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="day-info__readings">
        <h4 className="day-info__readings-name">{t('dayInfo.readings')}</h4>
        <div className="day-info__readings-wrapper">
          {dayData.gospel_reading && (
            <div className="day-info__reading">
              <div className="day-info__reading-header">
                <img
                  className="day-info__book-image"
                  src={GospelBookIcon}
                  alt="gospel"
                  width="64"
                  height="64"
                  loading="lazy"
                />
                <div className="day-info__reading-subtitle">
                  <p className="day-info__reading-title">{t('dayInfo.gospel_reading')}</p>
                  <p className="day-info__title">{dayData.gospel_title}</p>
                </div>
              </div>
              <Expandable
                collapsedHeight={180}
                buttonClassName="day-info__reading-button"
                expandedLabel={t('dayInfo.read_full')}
                collapsedLabel={t('dayInfo.hide')}
              >
                <p className="day-info__reading-content">
                  {dayData.gospel_reading}
                </p>
              </Expandable>

            </div>
          )}

          {dayData.apostolic_reading && (
            <div className="day-info__reading">
              <div className="day-info__reading-header">
                <img
                  className="day-info__book-image"
                  src={ApostolicBookIcon}
                  alt="apostolic"
                  width="64"
                  height="64"
                  loading="lazy"
                />
                <div className="day-info__reading-subtitle">
                  <p className="day-info__reading-title">{t('dayInfo.apostolic_reading')}</p>
                  <p className="day-info__title">{dayData.apostolic_title}</p>
                </div>
              </div>
              <Expandable
                collapsedHeight={180}
                buttonClassName="day-info__reading-button"
                expandedLabel={t('dayInfo.read_full')}
                collapsedLabel={t('dayInfo.hide')}
              >
                <p className="day-info__reading-content">
                  {dayData.apostolic_reading}
                </p>
              </Expandable>

            </div>
          )}
        </div>
      </div>

      {lightboxOpen && selectedImage && (
        <div
          className="day-info__lightbox"
          onClick={closeLightbox}
        >
          <span className="day-info__lightbox-close">&times;</span>
          <img
            className="day-info__lightbox-image"
            src={selectedImage.url}
            alt={selectedImage.alt}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default DayInfo