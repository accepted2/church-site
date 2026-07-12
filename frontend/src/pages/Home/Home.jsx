import { useMetaData } from "@/context/MetaDataContext";
import { useEffect } from "react";
import Content from "@/layouts/Content";
import Hero from "@/sections/Hero";
import RectorSection from "@/sections/RectorSection";
import ScheduleSection from "@/sections/ScheduleSection";
import ServiceSection from "@/sections/ServiceSection";
import CalendarSection from "@/sections/CalendarSection";
import { useLocation } from "react-router-dom";
import GallerySection from "@/sections/GallerySection";


export default function Home() {

  const location = useLocation()
  const { setMetaData } = useMetaData()

  useEffect(() => {
    const id = location.state?.scrollTo;

    if (!id) return;

    const scroll = () => {
      const element = document.getElementById(id);

      if (!element) return;

      const header = document.querySelector('.header');
      const headerOffset = header?.offsetHeight || 140;

      window.scrollTo({
        top: element.offsetTop - headerOffset,
        behavior: 'smooth'
      });
    };

    // первый скролл
    setTimeout(scroll, 100);

    // второй скролл после загрузки картинок и Swiper
    setTimeout(scroll, 700);

    window.history.replaceState({}, document.title);

  }, [location.state]);

  useEffect(() => {
    setMetaData({
      title: "Свято Петро-Павловский храм",
      isHeaderFixed: true,

    })
  }, [setMetaData]);

  return (
    <>
      <Hero />
      <RectorSection />
      <ScheduleSection />
      <ServiceSection />
      <CalendarSection />
      <GallerySection />
    </>
  )
}

