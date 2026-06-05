import './ZapiskaBanner.scss'
import clsx from "clsx";
import { useTranslation } from 'react-i18next';
import heroImage from '@/assets/images/hero_image-another.jpg'

const ZapiskaBanner = (props) => {
  const { className } = props;
  const { t } = useTranslation();

  return (
    <section className={clsx(className, 'zapiska-banner')}>
      <div className="zapiska-banner__image-wrapper">
        <img
          className="zapiska-banner__image"
          src={heroImage}
          alt=""
          width=""
          height=""
          loading="lazy"
        />
      </div>
      <div className="zapiska-banner__body container">
        <div className="zapiska-banner__content">
          <h1 className="zapiska-banner__title">{t('zapiska_banner.title')}</h1>
          <div className="zapiska-banner__subtitle">
            <p>{t('zapiska_banner.subtitle')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ZapiskaBanner