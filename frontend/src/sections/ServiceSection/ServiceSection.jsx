import './ServiceSection.scss'
import clsx from "clsx";
import { useTranslation } from 'react-i18next';
import ServiceItem from "@/components/ServiceItem";
import zapiskaImg from "@/assets/icons/zapiska.svg"
import pozertvovanieImg from "@/assets/icons/pozertvovanie.svg"
import trebiImg from "@/assets/icons/trebi.svg"

const ServiceSection = (props) => {
  const { className } = props;
  const { t } = useTranslation();

  const serviceItems = [
    {
      id: 1,
      imgSrc: zapiskaImg,
      title: t('service_section.submit_note'),
      description: t('service_section.submit_note_desc'),
      btnTitle: t('service_section.submit_note_btn'),
      subtitle: t('service_section.submit_note_subtitle'),
      linkTo: "/zapiski"
    },
    {
      id: 2,
      imgSrc: trebiImg,
      title: t('service_section.church_rites'),
      description: t('service_section.church_rites_desc'),
      btnTitle: t('service_section.church_rites_btn'),
      subtitle: t('service_section.church_rites_subtitle'),
      linkTo: "/services"
    },
    {
      id: 3,
      imgSrc: pozertvovanieImg,
      title: t('service_section.donations'),
      description: t('service_section.donations_desc'),
      btnTitle: t('service_section.donations_btn'),
      subtitle: t('service_section.donations_subtitle'),
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
            {t('service_section.title')}
          </h2>
        </div>
        <div className="service-section__body">
          {serviceItems.map((item) => (
            <ServiceItem {...item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServiceSection