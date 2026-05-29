import './Icon.scss'
import clsx from "clsx";
import Search from "@/assets/icons/search.svg?react";
import ArrowLeft from "@/assets/icons/arrow-left.svg?react";
import ArrowRight from "@/assets/icons/arrow-right.svg?react";
import ArrowStraightRight from "@/assets/icons/arrow-straight-right.svg?react";
import ArrowStraightLeft from "@/assets/icons/arrow-straight-left.svg?react";
import InstagramIcon from "@/assets/icons/instagram.svg?react";
import TelegramIcon from "@/assets/icons/telegram.svg?react";
import TiktokIcon from "@/assets/icons/tiktok.svg?react";
import EmailIcon from "@/assets/icons/email.svg?react";
import YoutubeIcon from "@/assets/icons/youtube.svg?react";
import CrossIcon from "@/assets/icons/cross-icon.svg?react"

const icons = {
  search: Search,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-straight-right": ArrowStraightRight,
  "arrow-straight-left": ArrowStraightLeft,
  "instagram-icon": InstagramIcon,
  "telegram-icon": TelegramIcon,
  "email-icon": EmailIcon,
  "tiktok-icon": TiktokIcon,
  "youtube-icon": YoutubeIcon,
  "cross-icon": CrossIcon,
}

const Icon = (props) => {
  const {
    iconClassName,
    name,

  } = props
  const Component = icons[name]
  if (!Component) return null

  return (
    <Component
      className={clsx(iconClassName, 'icon')}
    />
  )
}

export default Icon