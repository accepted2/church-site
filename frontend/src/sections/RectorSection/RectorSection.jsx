import './RectorSection.scss'
import clsx from "clsx";
import { useTranslation } from 'react-i18next';
import rectorImage from '@/assets/images/rector_image2.png'
import rectorBackgroundImage from '@/assets/images/rector_bg_image.jpeg'
import Button from "@/components/Button";

const RectorSection = (props) => {
  const { className } = props;
  const { t } = useTranslation();

  return (
    <section className={clsx(className, 'rector-section container')}>
      <div className="rector-section__body">
        <div className="rector-section__image-wrapper">
          <img
            className="rector-section__image"
            src={rectorImage}
            alt=""
            width="406"
            height="472"
          />
        </div>

        <div className="rector-section__content">
          <h2 className="rector-section__title">
            {t('rector.title_line1')} <br />{t('rector.title_line2')}
          </h2>
          <div className="rector-section__name">
            <span className="rector-section__fullname">
              {t('rector.fullname')}
            </span>
          </div>

          <Button
            className="rector-section__button"
            type="button"
            label={t('rector.more_button')}
            mode="accent"
          />
        </div>

        <div className="rector-section__background-image"></div>
      </div>
    </section>
  );
};

export default RectorSection;