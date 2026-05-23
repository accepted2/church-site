import { useMetaData } from "@/context/MetaDataContext";
import { useEffect } from "react";
import Content from "@/layouts/Content";
import Hero from "@/sections/Hero";
import RectorSection from "@/sections/RectorSection";
import ScheduleSection from "@/sections/ScheduleSection";
import ServiceSection from "@/sections/ServiceSection";
import CalendarSection from "@/sections/CalendarSection";
import { useLocation } from "react-router-dom";


export default function Home() {

  const location = useLocation()
  const { setMetaData } = useMetaData()

  useEffect(() => {
    const id = location.state?.scrollTo
    if (!id) {

      return
    }
    const scrollToElement = () => {
      const element = document.getElementById(id)
      if (element) {
        const headerOffset = 140
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        })

        window.history.replaceState({}, document.title)
      }
    }

    if (document.readyState === "complete") {
      const timeout = setTimeout(scrollToElement, 200)
      return () => clearTimeout(timeout)
    } else {
      window.addEventListener('load', scrollToElement)
      return () => window.removeEventListener('load', scrollToElement)
    }
  }, [location]);

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

    </>
  )
}

