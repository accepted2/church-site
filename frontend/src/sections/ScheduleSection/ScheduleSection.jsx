import './ScheduleSection.scss'
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { useTranslation } from 'react-i18next';
import api from '@/api';

import { getSchedule } from "@/utils/services/scheduleService";
import ScheduleDay from "@/components/ScheduleDay";
import Slider from "@/components/Slider";
import SliderNavigation from "@/components/Slider/components/SliderNavigation";

const ScheduleSection = (props) => {
  const { className } = props;
  const { t } = useTranslation();

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [data, setData] = useState([]);
  const swiperRef = useRef(null);

  useEffect(() => {
    getSchedule().then(setData).catch(console.error);
  }, []);

  const today = new Date();
  const todayIndex = data.findIndex((day) => {
    const dayDate = new Date(day.date);
    return (
      dayDate.getDate() === today.getDate() &&
      dayDate.getMonth() === today.getMonth() &&
      dayDate.getFullYear() === today.getFullYear()
    );
  });

  useEffect(() => {
    if (data.length > 0 && swiperRef.current && todayIndex >= 0) {
      swiperRef.current.slideTo(todayIndex);
    }
  }, [data, todayIndex]);

  return (
    <section
      className={clsx(className, 'schedule-section container')}
      id="services"
    >
      <div className="schedule-section__inner">
        <SliderNavigation
          prevRef={prevRef}
          nextRef={nextRef}
          mode="tile"
        />
        <div className="schedule-section__header">
          <h2 className="schedule-section__title">
            {t('schedule.title')}
          </h2>
        </div>
        <div className="schedule-section__body">
          <Slider
            prevRef={prevRef}
            nextRef={nextRef}
            initialSlide={todayIndex >= 0 ? todayIndex : 0}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
          >
            {data.map((day, index) => (
              <ScheduleDay
                key={day.id}
                day={day}
                isToday={index === todayIndex}
              />
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;