import './Footer.scss'
import clsx from "clsx";
import Button from "@/components/Button";

const Footer = (props) => {
  const {
    className,
  } = props

  const footerMenuItems = [
    {
      title: "О храме",
      links: [
        { label: 'История храма', to: '/about/history' },
        { label: 'Духовенство', to: '/about/clergy' },
        { label: 'Воскресная школа', to: '/about/sunday-school' },
        { label: 'Новости храма', to: '/news' },
      ],
    },
    {
      title: 'Богослужения',
      links: [
        { label: 'Расписание Богослужений', href: '#services' },
        { label: 'Таинства', to: '/services/sacraments' },
        { label: 'Подать записку', to: '/treby/zapiski?type=zapiska' },
        { label: 'Заказать молебен', to: '/treby/zapiski?type=moleben' },
        { label: 'Сорокоуст', to: '/treby/zapiski?type=sorokoust' },
        { label: 'Панихида', to: '/treby/zapiski?type=panihida' },

      ]
    },
    {
      title: 'Церковные требы',
      href: '#requests',
      links: [
        { label: "Венчание", to: '/services/wedding' },
        { label: "Крещение", to: '/services/baptism' },
        { label: "Отпевание", to: '/services/funeral' },
      ]
    },
    {
      title: "Информация",
      links: [
        { label: 'Православный Календарь', href: '#calendar' },
        { label: 'Пожертвование', to: '/treby/donations' },
        { label: "Задать вопрос", to: '/contacts#question' },
      ]
    },
    {
      title: "Контакты",
      socialLinks: [
        {
          label: 'Instagram',
          iconName: 'instagram-icon',
          url: 'https://instagram.com/ваш_аккаунт'
        }, {
          label: 'Telegram',
          iconName: 'telegram-icon',
          url: 'https://t.me/ваш_канал'
        },
        {
          label: 'Tiktok',
          iconName: 'tiktok-icon',
          url: 'https://tiktok.com/@ваш_аккаунт'
        },
        {
          label: 'YouTube',
          iconName: 'youtube-icon',
          url: 'https://youtube.com/@ваш_канал'
        },
        {
          label: 'Email',
          iconName: 'email-icon',
          url: 'mailto:church@example.com'
        },
      ]
    }
  ]

  const extraLinks = [
    { label: 'Политика конфиденциальности', to: '/privacy' },
    { label: 'Пользовательское соглашение', to: '/terms' },
    { label: 'Согласие на обработку ПД', to: '/personal-data' },
    { label: 'Политика cookie', to: '/cookie' },
  ]

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
              <h4 className=" footer__menu-title">
                {item.title}</h4>

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
            © <time dateTime={new Date().getFullYear()}>
            {new Date().getFullYear()}</time> Свято-Петро-Павловский храм
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
  )
}

export default Footer