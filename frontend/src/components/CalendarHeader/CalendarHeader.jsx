import './CalendarHeader.scss'
import clsx from "clsx";
import { useTranslation } from 'react-i18next';
import Button from "@/components/Button";

const CalendarHeader = (props) => {
  const {
    className,
    onPrevMonth,
    onNextMonth,
    currentDate,
    iconPrevName,
    iconNextName
  } = props

  const { t, i18n } = useTranslation();

  // Определяем локаль для форматирования месяца
  const locale = i18n.language === 'uk' ? 'uk-UA' : 'ru-RU';
  const month = currentDate.toLocaleString(locale, { month: 'long' })
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1)

  const year = currentDate.getFullYear();

  return (
    <div className={clsx(className, 'calendar-header')}>
      <Button
        className="calendar-header__button"
        iconName={iconPrevName}
        onClick={onPrevMonth}
      />

      <h2 className="calendar-header__title">
        <span className="calendar-header__month">{formattedMonth}</span>
        <span className="calendar-header__year">{year} {t('calendar.year_abbr')}</span>
      </h2>

      <Button
        className="calendar-header__button"
        iconName={iconNextName}
        onClick={onNextMonth}
      />
    </div>
  )
}

export default CalendarHeader