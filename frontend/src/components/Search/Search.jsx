import './Search.scss'
import clsx from "clsx";
import Icon from "@/components/Icon";

const Search = (props) => {
  const {
    className,
  } = props

  return (
    <div
      className={clsx(className, 'search')}
    >

      <Icon
        name="search"
        className="search__icon"
      />
      <input
        className="search__input"
        type="text"
        placeholder="Поиск"
      />

    </div>
  )
}

export default Search