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
  } = props

  const { i18n } = useTranslation();

  // Определяем локаль для форматирования месяца
  const locale = i18n.language === 'uk' ? 'uk-UA' : 'ru-RU';

  return (
    <div className={clsx(className, 'calendar-header')}>
      <Button
        className="calendar-header__button"
        iconName="arrow-left"
        onClick={onPrevMonth}
      />

      <h2 className="calendar-header__title">
        {currentDate.toLocaleString(locale, {
          month: 'long',
          year: 'numeric'
        })}
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