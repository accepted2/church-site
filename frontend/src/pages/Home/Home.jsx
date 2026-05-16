import { useMetaData } from "@/context/MetaDataContext";
import { useEffect } from "react";
import Content from "@/layouts/Content";
import Hero from "@/sections/Hero";
import RectorSection from "@/sections/RectorSection";
import ScheduleSection from "@/sections/ScheduleSection";
import ServiceSection from "@/sections/ServiceSection";
import CalendarSection from "@/sections/CalendarSection";


export default function Home() {
  const { setMetaData } = useMetaData()

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

