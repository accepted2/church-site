import './Icon.scss'
import clsx from "clsx";
import Search from "@/assets/icons/search.svg?react";
import ArrowLeft from "@/assets/icons/arrow-left.svg?react";
import ArrowRight from "@/assets/icons/arrow-right.svg?react";

const icons = {
  search: Search,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
}

const Icon = (props) => {
  const {
    className,
    name,

  } = props
  const Component = icons[name]
  if (!Component) return null

  return (
    <Component
      className={clsx(className, 'icon')}
    />
  )
}

export default Icon