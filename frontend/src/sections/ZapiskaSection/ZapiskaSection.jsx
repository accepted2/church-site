import './ZapiskaSection.scss'
import clsx from "clsx";
import ZapiskaForm from "@/components/ZapiskaForm";

const ZapiskaSection = (props) => {
  const {
    className,
  } = props

  return (
    <div
      className={clsx(className, 'zapiska-section')}
    >
      <ZapiskaForm />
    </div>
  )
}

export default ZapiskaSection