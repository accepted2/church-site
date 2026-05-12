import './Header.scss'
import clsx from "clsx";
import Logo from "@/components/Logo";
import { useEffect, useRef, useState } from "react";
import Search from "@/components/Search";
import BurgerButton from "@/components/BurgerButton";

const Header = (props) => {
  const { className } = props

  const menuItems = [
    { label: 'О Храме', href: '#about' },
    { label: 'Богослужения', href: '#services' },
    { label: 'Требы', href: '#requests' },
    { label: 'Пожертвования', href: '#donations' },
    { label: 'Контакты', href: '#contacts' },
  ]

  const [active, setActive] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const ticking = useRef(false)


  const toggleMenu = () => setIsOpen(prev => !prev)
  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!isOpen) {
        setIsScrolled(window.scrollY > 50)
      }
    }
    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""

  }, [isOpen]);

  return (
    <header
      className={clsx(className, 'header', {
        'header--scrolled': isScrolled && !isOpen,
      })}
    >
      <div className="header__inner container">

        <Logo
          loading="eager"
          className="header__logo visible-tablet"
        />

        <div
          className={clsx("header__overlay", { "is-open": isOpen })}
          onClick={closeMenu}
        >
          <div
            className="header__overlay-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="header__left">
              <Logo
                className="header__logo "
                loading="eager"
              />

              <nav className="header__menu">
                <ul className="header__menu-list">
                  {menuItems.map(({ label, href }) => {
                    const id = href.replace('#', '')

                    return (
                      <li
                        className="header__menu-item"
                        key={label}
                      >
                        <a
                          className={clsx("header__menu-link", {
                            active: id === active,
                          })}
                          href={href}
                          onClick={(e) => {
                            e.preventDefault()
                            setActive(id)
                            closeMenu()
                          }}
                        >
                          {label}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </div>

            <div className="header__actions">
              <Search />
            </div>
          </div>
        </div>

        <BurgerButton
          className="header__burger-button visible-tablet"
          onClick={toggleMenu}
          isOpen={isOpen}
        />
      </div>
    </header>
  )
}

export default Header