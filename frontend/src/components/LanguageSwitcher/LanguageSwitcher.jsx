import './LanguageSwitcher.scss'
import clsx from "clsx";
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = (props) => {
  const { className } = props;
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={clsx(className, 'language-switcher')}>
      <button
        className={clsx('language-switcher__button', {
          'language-switcher__button--active': i18n.language === 'ru'
        })}
        onClick={() => changeLanguage('ru')}
      >
        Русский
      </button>
      <button
        className={clsx('language-switcher__button', {
          'language-switcher__button--active': i18n.language === 'uk'
        })}
        onClick={() => changeLanguage('uk')}
      >
        Українська
      </button>
    </div>
  );
};

export default LanguageSwitcher;