import './Search.scss'
import clsx from "clsx";
import Icon from "@/components/Icon";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

const Search = (props) => {
  const {
    className,
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const inputRef = useRef(null)

  const toggleSearch = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickIutside = (event) => {
      if (isOpen && !event.target.closest('.search')) {
        setIsOpen(false)
        setSearchValue('')
      }
    }

    document.addEventListener('click', handleClickIutside)
    return () => document.removeEventListener('click', handleClickIutside)
  }, [isOpen]);

  const handleSearch = (event) => {
    event.preventDefault()
    if (searchValue.trim()) {
      console.log('Поиск', searchValue)
    }
  }

  return (
    <form
      className={clsx(className, 'search', {
        'search--open': isOpen
      })}
      onSubmit={handleSearch}
    >
      <Button
        className="search__trigger"
        onClick={toggleSearch}
        iconName="search"
      />
      <div className="search__field">
        <input
          ref={inputRef}
          className="search__input"
          type="text"
          placeholder="Поиск..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        {searchValue && (
          <button
            className="search__clear"
            onClick={() => setSearchValue('')}
          >✕
          </button>
        )}
      </div>
    </form>

  )
}

export default Search