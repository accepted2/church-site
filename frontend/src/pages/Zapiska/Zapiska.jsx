import './Zapiska.scss'
import clsx from "clsx";
import { useMetaData } from "@/context/MetaDataContext";
import { useEffect } from "react";
import ZapiskaBanner from "@/sections/ZapiskaBanner";
import ZapiskaSection from "@/sections/ZapiskaSection";

const Zapiska = (props) => {
  const {
    className,
  } = props

  const { setMetaData } = useMetaData()

  useEffect(() => {
    setMetaData({
      title: "Подать Записку | Храм",
      isHeaderFixed: true,
    })
  }, [setMetaData]);

  return (
    <>
      <ZapiskaBanner />
      <ZapiskaSection />
    </>

  )
}

export default Zapiska