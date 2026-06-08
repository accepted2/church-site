import './LanguageSwitcher.scss'
import clsx from "clsx";
import { useTranslation } from 'react-i18next';
import Button from "@/components/Button";

const LanguageSwitcher = (props) => {
  const { className } = props;
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={clsx(className, 'language-switcher')}>
      <Button
        className={clsx('language-switcher__button', {
          'language-switcher__button--active': i18n.language === 'uk'
        })}
        onClick={() => changeLanguage('uk')}
        label="Укр"
      />

      <Button
        className={clsx('language-switcher__button', {
          'language-switcher__button--active': i18n.language === 'ru'
        })}
        onClick={() => changeLanguage('ru')}
        label="Рус"
      />

    </div>
  );
};

export default LanguageSwitcher;