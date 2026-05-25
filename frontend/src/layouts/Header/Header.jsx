import './Header.scss'

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import Logo from '@/components/Logo'
import Search from '@/components/Search'
import Button from '@/components/Button'
import BurgerButton from '@/components/BurgerButton'
import Icon from '@/components/Icon'
import { useNavigate, useLocation } from "react-router-dom";


const Header = ({ className, isFixed = false }) => {
  const menuItems = [
    {
      label: 'О Храме',
      href: '#about',
      dropdown: [
        { label: 'История храма', to: '/about/history' },
        { label: 'Духовенство', to: '/about/clergy' },
        { label: 'Воскресная школа', to: '/about/sunday-school' },
        { label: 'Новости храма', to: '/news' },
      ]
    },
    {
      label: 'Богослужения',
      href: '#services',

    },
    {
      label: 'Церковные требы',
      href: '#requests',
      dropdown: [
        { label: 'Подать записку', to: '/treby/zapiski?type=zapiska' },
        { label: 'Заказать молебен', to: '/treby/zapiski?type=moleben' },
        { label: 'Сорокоуст', to: '/treby/zapiski?type=sorokoust' },
        { label: 'Панихида', to: '/treby/zapiski?type=panihida' },
        { label: 'Пожертвование', to: '/treby/donations' },
      ]
    },
    {
      label: 'Контакты',
      href: '#contacts'
    },
    {
      label: 'Календарь',
      href: '#calendar'
    },
  ]

  const navigate = useNavigate()
  const location = useLocation()

  const headerRef = useRef(null)
  const hoverTimeoutRef = useRef(null)

  const [active, setActive] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

  const isDesktop = () => window.innerWidth >= 1024

  useEffect(() => {
    const sections = ['about', 'services', 'requests', 'calendar'];

    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 150; // с учётом хедера

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActive(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy);
    handleScrollSpy();

    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  const scrollToSection = (elementId, event) => {
    if (event) event.preventDefault()

    const isHomePage = location.pathname === '/'

    if (!isHomePage) {
      navigate('/', {
        state: { scrollTo: elementId },
        replace: false
      })
      return
    }
    const element = document.getElementById(elementId);
    if (element) {
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Обновляем URL (опционально)
      window.history.pushState(null, '', `#${elementId}`);
      setActive(elementId)

      closeMenu()
    }
  }

  useEffect(() => {
    setActive('')
  }, [location.pathname]);

  const openMenu = () => {
    setIsOpen(true)
    setOpenDropdown(null)
  }

  const closeMenu = () => {
    setIsOpen(false)
    setOpenDropdown(null)
  }

  const toggleMenu = () => {
    setIsOpen(prev => !prev)
    setOpenDropdown(null)
  }

  const toggleDropdown = (label) => {
    if (isDesktop()) {
      return
    }
    setOpenDropdown(prev => (prev === label ? null : label))
  }

  const handleDropdownEnter = (label) => {
    if (!isDesktop()) return
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setOpenDropdown(label)
  }

  const handleDropdownLeave = () => {
    if (!isDesktop()) return
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 150)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!isOpen) {
        setIsScrolled(window.scrollY > 50)
      }
    }

    const handleResize = () => {
      if (isDesktop()) {
        setIsOpen(false)
      } else {
        setOpenDropdown(null)
      }
    }

    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenDropdown(null)
        if (isDesktop()) return
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!window.location.hash) return

    const id = window.location.hash.substring(1)
    setActive(id)

    const element = document.getElementById(id)
    if (!element) return

    setTimeout(() => {
      const headerOffset = 140
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }, 100)
  }, [])

  return (
    <header
      ref={headerRef}
      className={clsx(className, 'header', {
        'header--scrolled': isScrolled && !isOpen,
        'header--fixed': isFixed,
      })}
    >
      <div className="header__inner container">
        <Logo
          loading="eager"
          className="header__logo visible-tablet"
        />

        <div
          className={clsx('header__overlay', { 'is-open': isOpen })}
          onClick={closeMenu}
        >
          <div
            className="header__overlay-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="header__left">
              <Logo
                loading="eager"
                className="header__logo"
              />

              <nav className="header__menu">
                <ul className="header__menu-list">
                  {menuItems.map((item) => {
                    const { label, href, dropdown } = item
                    const id = href?.startsWith('#') ? href.substring(1) : ''
                    const isDropdownOpen = openDropdown === label

                    if (dropdown) {
                      return (
                        <li
                          key={label}
                          className={clsx(
                            'header__menu-item',
                            'header__menu-item--dropdown',
                            { 'is-open': isDropdownOpen }
                          )}
                          onMouseEnter={() => handleDropdownEnter(label)}
                          onMouseLeave={handleDropdownLeave}
                          onFocus={() => handleDropdownEnter(label)}
                          onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) {
                              handleDropdownLeave()
                            }
                          }}
                        >
                          <div className="header__menu-dropdown-row">
                            <Button
                              className={clsx('header__menu-link', {
                                active: id === active,
                              })}
                              href={href}

                              onClick={(event) => scrollToSection(id, event)}
                              iconName="arrow-straight-right"
                              iconClassName="hidden-tablet"
                              iconPosition="after"
                              label={label}
                            />

                            <button
                              type="button"
                              className="dropdown-arrow"
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                toggleDropdown(label)
                              }}
                              aria-expanded={isDropdownOpen}
                              aria-haspopup="true"
                              aria-label={`Открыть подменю "${label}"`}
                            >
                              <Icon name="arrow-straight-right" />
                            </button>
                          </div>

                          <ul
                            className={clsx('header__dropdown', {
                              'is-open': isDropdownOpen
                            })}
                          >
                            {dropdown.map((dropdownItem) => (
                              <li key={dropdownItem.label}>
                                <Button
                                  className="header__dropdown-link"
                                  to={dropdownItem.to}
                                  label={dropdownItem.label}

                                  onClick={closeMenu}
                                />
                              </li>
                            ))}
                          </ul>
                        </li>
                      )
                    }

                    return (
                      <li
                        key={label}
                        className="header__menu-item"
                      >
                        <Button
                          className={clsx('header__menu-link', {
                            active: id === active,
                          })}
                          href={href}
                          onClick={(event) => scrollToSection(id, event)}
                        >
                          {label}
                        </Button>
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