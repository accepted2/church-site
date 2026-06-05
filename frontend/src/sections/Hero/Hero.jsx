import './Hero.scss'
import clsx from "clsx";
import { useTranslation } from 'react-i18next';

const Hero = (props) => {
  const { className } = props;
  const { t } = useTranslation();

  return (
    <section
      className={clsx(className, 'hero')}
      id="about"
    >
      <div className="hero__image">
        <div className="hero__bg" />
      </div>
      <div className="hero__overlay" />
      <div className="hero__inner container">
        <div className="hero__content">
          <div className="hero__text-wrapper">
            <p className="hero__subtitle">
              {t('hero.subtitle')}
            </p>
            <h1 className="hero__title">
              {t('hero.title')}
            </h1>
            <p className="hero__church-type">
              {t('hero.church_type')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;