import './Footer.scss'
import clsx from "clsx";
import Button from "@/components/Button";
import { useTranslation } from 'react-i18next';

const Footer = (props) => {
  const { className } = props;
  const { t } = useTranslation();

  const footerMenuItems = [
    {
      title: t('footer.about_church'),
      links: [
        { label: t('footer.history'), to: '/about/history' },
        { label: t('footer.clergy'), to: '/about/clergy' },
        { label: t('footer.sunday_school'), to: '/about/sunday-school' },
        { label: t('footer.news'), to: '/news' },
      ],
    },
    {
      title: t('footer.services'),
      links: [
        { label: t('footer.schedule'), href: '#services' },
        { label: t('footer.sacraments'), to: '/services/sacraments' },
        { label: t('footer.submit_note'), to: '/treby/zapiski?type=zapiska' },
        { label: t('footer.order_moleben'), to: '/treby/zapiski?type=moleben' },
        { label: t('footer.sorokoust'), to: '/treby/zapiski?type=sorokoust' },
        { label: t('footer.panikhida'), to: '/treby/zapiski?type=panihida' },
      ]
    },
    {
      title: t('footer.church_rites'),
      links: [
        { label: t('footer.wedding'), to: '/services/wedding' },
        { label: t('footer.baptism'), to: '/services/baptism' },
        { label: t('footer.funeral'), to: '/services/funeral' },
      ]
    },
    {
      title: t('footer.information'),
      links: [
        { label: t('footer.calendar'), href: '#calendar' },
        { label: t('footer.donation'), to: '/treby/donations' },
        { label: t('footer.ask_question'), to: '/contacts#question' },
      ]
    },
    {
      title: t('footer.contacts'),
      socialLinks: [
        { label: 'Instagram', iconName: 'instagram-icon', url: 'https://instagram.com/ваш_аккаунт' },
        { label: 'Telegram', iconName: 'telegram-icon', url: 'https://t.me/ваш_канал' },
        { label: 'Tiktok', iconName: 'tiktok-icon', url: 'https://tiktok.com/@ваш_аккаунт' },
        { label: 'YouTube', iconName: 'youtube-icon', url: 'https://youtube.com/@ваш_канал' },
        { label: 'Email', iconName: 'email-icon', url: 'mailto:church@example.com' },
      ]
    }
  ];

  const extraLinks = [
    { label: t('footer.privacy_policy'), to: '/privacy' },
    { label: t('footer.terms_of_use'), to: '/terms' },
    { label: t('footer.personal_data_consent'), to: '/personal-data' },
    { label: t('footer.cookie_policy'), to: '/cookie' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={clsx(className, 'footer')}
      id="contacts"
    >
      <div className="footer__inner container">
        <nav className="footer__menu">
          {footerMenuItems.map((item) => (
            <div
              className="footer__menu-column"
              key={item.title}
            >
              <h4 className="footer__menu-title">{item.title}</h4>

              {item.links && item.links.length > 0 && (
                <ul className="footer__menu-list">
                  {item.links.map((link) => (
                    <li
                      className="footer__menu-item"
                      key={link.label}
                    >
                      <Button
                        to={link.to}
                        href={link.href}
                        label={link.label}
                        isLink={true}
                        className="footer__menu-link"
                      />
                    </li>
                  ))}
                </ul>
              )}
              {item.socialLinks && (
                <div className="footer__soc1als">
                  {item.socialLinks.map((socialLink) => (
                    <Button
                      key={socialLink.label}
                      href={socialLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      iconName={socialLink.iconName}
                      className="footer__soc1als-link"
                      aria-label={socialLink.label}
                      isLabelHidden={true}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="footer__bottom">
          <div className="footer__copyright">
            © <time dateTime={currentYear}>{currentYear}</time> {t('footer.church_name')}
          </div>
          <div className="footer__legal">
            {extraLinks.map((link) => (
              <Button
                key={link.label}
                to={link.to}
                label={link.label}
                isLink={true}
                className="footer__legal-link"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;