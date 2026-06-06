import './DayInfoPanel.scss'
import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import Button from "@/components/Button";
import AccordionItem from "@/components/AccordionItem";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DayInfoPanel = (props) => {
  const {
    className,
    selectedDay,
    style,
  } = props

  const { t, i18n } = useTranslation();


  const locale = i18n.language === 'uk' ? 'uk-UA' : 'ru-RU';
  const [activeTab, setActiveTab] = useState(null)

  if (!selectedDay) return null

  const selectedDate = new Date(selectedDay.date_gregorian)

  const mainFeast = selectedDay.main_feast
  const allFeasts = selectedDay.all_feasts || selectedDay.feasts || []

  const fastName = selectedDay.fast_name
  const fastTypeTitle = selectedDay.fast_type_title

  const fastText = fastName && fastTypeTitle
    ? `${fastName} — ${fastTypeTitle}`
    : fastName || fastTypeTitle

  const hasFast = Boolean(fastText)

  const toggleContent = (tab) => {
    setActiveTab(prev => prev === tab ? null : tab)
  }

  const displayFeast = mainFeast || allFeasts[0]
  if (!displayFeast) return null

  return (
    <div
      className={clsx(className, 'day-info-panel')}
      style={style}
    >
      <div className="day-info-panel__content">
        <div className="day-info-panel__date">
          <time
            className="day-info-panel__date-text"
            dateTime={selectedDay.date_gregorian}
          >
            {selectedDate.toLocaleString(locale, {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </time>
        </div>

        <div className="day-info-panel__data">
          {displayFeast.icon && (
            <img
              src={displayFeast.icon}
              className="day-info-panel__feast-image"
              alt={displayFeast.short_title || displayFeast.title}
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}

          <div className="day-info-panel__info">
            <span className="day-info-panel__memory">{t('calendar.day_of_memory')}</span>
            <h3 className="day-info-panel__title">
              {displayFeast.short_title || displayFeast.title}
            </h3>
            {hasFast ? (
              <p className="day-info-panel__fast">{fastText}</p>
            ) : (
              <p className="day-info-panel__fast no-fast">{t('calendar.no_fast')}</p>
            )}
          </div>
        </div>

        {allFeasts.length > 1 && (
          <div className="day-info-panel__all-feasts">
            <span className="all-feasts-label">{t('calendar.also_today')}</span>
            <div className="all-feasts-list">
              {allFeasts
                .filter(feast => feast.id !== displayFeast.id)
                .map(feast => (
                  <div
                    key={feast.id}
                    className="all-feast-item"
                  >
                    <Button
                      to={`/saint/${feast.id}`}
                      label={feast.short_title || feast.title}
                      isLink={true}
                      className="all-feast-link"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="day-info-panel__actions">
        {displayFeast.troparion_content && (
          <AccordionItem
            className="day-info-panel__accordion"
            title={t('calendar.troparion')}
            isActive={activeTab === 'troparion'}
            onToggle={() => toggleContent('troparion')}
          >
            <h4 className="content-title">
              {t('calendar.troparion_title', { echo: displayFeast.troparion_echo })}
            </h4>
            <p className="content-text">{displayFeast.troparion_content}</p>
          </AccordionItem>
        )}

        {displayFeast.kontakion_content && (
          <AccordionItem
            className="day-info-panel__accordion"
            title={t('calendar.kontakion')}
            isActive={activeTab === 'kontakion'}
            onToggle={() => toggleContent('kontakion')}
          >
            <h4 className="content-title">
              {t('calendar.kontakion_title', { echo: displayFeast.kontakion_echo })}
            </h4>
            <p className="content-text">{displayFeast.kontakion_content}</p>
          </AccordionItem>
        )}

        <Button
          className="day-info-panel__life-button"
          label={t('calendar.life_of_saint')}
          to={`/day/${selectedDay.date_gregorian}`}
        />

        <Button
          className="day-info-panel__more-button"
          label={t('calendar.more_about_day')}
          to={`/day/${selectedDay.date_gregorian}`}
        />
      </div>
    </div>
  )
}

export default DayInfoPanel