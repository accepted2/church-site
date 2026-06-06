import './CalendarWeekdays.scss'
import clsx from "clsx";
import { useTranslation } from 'react-i18next';

const CalendarWeekdays = (props) => {
  const { className } = props;
  const { t } = useTranslation();

  const weekdays = [
    t('weekdays.mon'),
    t('weekdays.tue'),
    t('weekdays.wed'),
    t('weekdays.thu'),
    t('weekdays.fri'),
    t('weekdays.sat'),
    t('weekdays.sun')
  ];

  return (
    <div className={clsx(className, 'calendar-weekdays')}>
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