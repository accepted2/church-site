import './DayInfoPanel.scss'
import clsx from "clsx";
import { useState } from "react";
import Button from "@/components/Button";
import AccordionItem from "@/components/AccordionItem";

const DayInfoPanel = (props) => {
  const {
    className,
    selectedDay,
    style,
  } = props

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
      {/* ДАТА */}


      {/* КОНТЕНТ (икона + название + пост) */}
      <div className="day-info-panel__content">
        <div className="day-info-panel__date">
          <time
            className="day-info-panel__date-text"
            dateTime={selectedDay.date_gregorian}
          >
            {selectedDate.toLocaleString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </time>
        </div>

        <div className="day-info-panel__data">
          {displayFeast.icon && (
            <img
              src={`http://localhost:8000${displayFeast.icon}`}
              className="day-info-panel__feast-image"
              alt={displayFeast.short_title_ru || displayFeast.title_ru}
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}

          <div className="day-info-panel__info">
            <span className="day-info-panel__memory">День памяти</span>
            <h3 className="day-info-panel__title">
              {displayFeast.short_title_ru || displayFeast.title_ru}
            </h3>
            {hasFast ? (
              <p className="day-info-panel__fast">{fastText}</p>
            ) : (
              <p className="day-info-panel__fast no-fast">Поста нет</p>
            )}
          </div>
        </div>
        {allFeasts.length > 1 && (
          <div className="day-info-panel__all-feasts">
            <span className="all-feasts-label">Также сегодня:</span>
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
                      label={feast.short_title_ru || feast.title_ru}
                      isLink={true}
                      className="all-feast-link"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ДЕЙСТВИЯ (тропарь, кондак, кнопки) */}
      <div className="day-info-panel__actions">
        {displayFeast.troparion_content && (
          <AccordionItem
            className="day-info-panel__accordion"
            title="Тропарь"
            isActive={activeTab === 'troparion'}
            onToggle={() => toggleContent('troparion')}
          >
            <h4 className="content-title">Тропарь, глас {displayFeast.troparion_echo}</h4>
            <p className="content-text">{displayFeast.troparion_content}</p>
          </AccordionItem>
        )}

        {displayFeast.kontakion_content && (
          <AccordionItem
            className="day-info-panel__accordion"
            title="Кондак"
            isActive={activeTab === 'kontakion'}
            onToggle={() => toggleContent('kontakion')}
          >
            <h4 className="content-title">Кондак, глас {displayFeast.kontakion_echo}</h4>
            <p className="content-text">{displayFeast.kontakion_content}</p>
          </AccordionItem>
        )}

        <Button
          className="day-info-panel__life-button"
          label="Житие святого"
          to={`/day/${selectedDay.date_gregorian}`}
        />

        <Button
          className="day-info-panel__more-button"
          label="Подробнее о дне"
          to={`/day/${selectedDay.date_gregorian}`}
        />
      </div>

      {/* ДРУГИЕ СВЯТЫЕ ДНЯ */}

    </div>
  )
}

export default DayInfoPanel