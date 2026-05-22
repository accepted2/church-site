import './Icon.scss'
import clsx from "clsx";
import Search from "@/assets/icons/search.svg?react";
import ArrowLeft from "@/assets/icons/arrow-left.svg?react";
import ArrowRight from "@/assets/icons/arrow-right.svg?react";
import ArrowStraightRight from "@/assets/icons/arrow-straight-right.svg?react";
import ArrowStraightLeft from "@/assets/icons/arrow-straight-left.svg?react";

const icons = {
  search: Search,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-straight-right": ArrowStraightRight,
  "arrow-straight-left": ArrowStraightLeft,
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