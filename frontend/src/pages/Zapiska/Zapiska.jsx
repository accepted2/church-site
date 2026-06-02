import './Zapiska.scss'
import clsx from "clsx";
import { useMetaData } from "@/context/MetaDataContext";
import { useEffect } from "react";
import ZapiskaBanner from "@/sections/ZapiskaBanner";
import ZapiskaSection from "@/sections/ZapiskaSection";
import { useLocation, useSearchParams } from "react-router-dom";

const Zapiska = (props) => {
  const {
    className,
  } = props
  const location = useLocation()
  const { setMetaData } = useMetaData()

  useEffect(() => {
    setMetaData({
      title: "Подать Записку | Храм",
      isHeaderFixed: true,
    })

    window.scrollTo(0, 0)

  }, [location.pathname]);

  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')

  const getDefaultTypeId = () => {
    if (type === 'sorokoust') {
      return 10
    }
    if (type === 'moleben') {
      return 3
    }
    if (type === 'panihida') {
      return 4
    }
    return null
  }

  return (
    <>
      <ZapiskaBanner />
      <ZapiskaSection defaultTypeId={getDefaultTypeId()} />
    </>

  )
}

export default Zapiska