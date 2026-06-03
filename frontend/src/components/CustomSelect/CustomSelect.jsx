import './CustomSelect.scss'
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

const CustomSelect = (props) => {
  const {
    className,
    options,
    value,
    onChange,
    placeholder,
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, []);

  const handleSelect = (option) => {
    onChange(option.value)
    setIsOpen(false)
    triggerRef.current?.focus()
  }
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(!isOpen)

    }
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false)
      triggerRef.current?.focus()
    }
  }
  const selectedOption = options.find(option => option.value === value)

  return (
    <div
      className={clsx(className, 'custom-select')}
      ref={containerRef}
    >
      <div
        ref={triggerRef}
        className={clsx('custom-select__trigger', { 'open': isOpen })}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        aria-label={placeholder || 'Выберите вариант'}
        tabIndex={0}
      >
        <span className="custom-select__value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={clsx('custom-select__arrow', { 'open': isOpen })}>
          <Icon
            name="arrow-straight-right"
          />
        </span>
      </div>
      {isOpen && (
        <div
          className="custom-select__dropdown"
          role="listbox"
          aria-label="Список вариантов"
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={clsx('custom-select__option', {
                'selected': value === option.value
              })}
              onClick={() => handleSelect(option)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleSelect(option)
                }
              }}
              role="option"
              aria-selected={value === option.value}
              tabIndex={0}
            >
              {option.label}
            </div>
          ))}
        </div>
      )

      }

    </div>
  )
}

export default CustomSelect