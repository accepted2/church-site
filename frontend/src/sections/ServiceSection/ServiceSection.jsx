import './ServiceSection.scss'
import clsx from "clsx";
import ServiceItem from "@/components/ServiceItem";
import zapiskaImg from "@/assets/icons/zapiska.svg"
import pozertvovanieImg from "@/assets/icons/pozertvovanie.svg"
import trebiImg from "@/assets/icons/trebi.svg"

const ServiceSection = (props) => {
  const {
    className,
  } = props

  const serviceItems = [
    {
      id: 1,
      imgSrc: zapiskaImg,
      title: "Подать записку",
      description: "Вы можете подать записку о здравии или упокоении на богослужении.",
      btnTitle: "Подать записку",
      subtitle: "Подробнее о записках",
      linkTo: "/zapiska"
    },
    {
      id: 2,
      imgSrc: trebiImg,
      title: "Церковные требы",
      description: "Крещение, венчание, отпевание и другие таинства и требы в храме",
      btnTitle: "Подробнее о требах",
      subtitle: "все виды треб",
      linkTo: "/services"
    },
    {
      id: 3,
      imgSrc: pozertvovanieImg,
      title: "Пожертвования",
      description: "Ваше пожертвование помогает храму и служению на славу Божию",
      btnTitle: "Пожертвовать",
      subtitle: "Способы пожертвования",
      linkTo: "/donations"
    },

  ]

  return (
    <section

      className={clsx(className, 'service-section container')}
      id="requests"
    >
      <div className="service-section__inner">
        <div className="service-section__header">
          <h2 className="service-section__title">
            Требы, записки и пожертвования
          </h2>
        </div>
        <div className="service-section__body">
          {serviceItems.map((item) => (
            <ServiceItem
              {...item}
              key={item.id}
            />
          ))}

        </div>
      </div>
    </section>
  )
}

export default ServiceSection