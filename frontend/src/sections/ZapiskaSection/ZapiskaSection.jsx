import './ZapiskaSection.scss'
import clsx from "clsx";
import ZapiskaForm from "@/components/ZapiskaForm";

const ZapiskaSection = (props) => {
  const {
    className,
    defaultTypeId,
  } = props

  return (
    <section
      className={clsx(className, 'zapiska-section container')}
    >
      <ZapiskaForm defaultTypeId={defaultTypeId} />
    </section>
  )
}

export default ZapiskaSection