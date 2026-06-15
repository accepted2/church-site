import './SliderNavigation.scss'
import clsx from "clsx";
import Button from "@/components/Button";

const SliderNavigation = (props) => {
  const {
    className,
    prevRef,
    nextRef,
    paginationRef,

    mode = '',
    paginationPosition = 'between',

    iconNameLeft,
    iconNameRight,
  } = props


  return (
    <div
      className={clsx(
        className,
        'slider-navigation',
        `slider-navigation--pagination-${paginationPosition}`,
        {
          [`slider-navigation--${mode}`]: mode,
        }
      )}
    >

      <Button
        ref={prevRef}
        className="slider-navigation__arrow-button slider-navigation__arrow-button--previous"
        mode="accent"
        iconName={iconNameLeft}
        label="Previous slide"
        isLabelHidden
      />

      {paginationPosition === 'between' && (
        <div
          className="slider-navigation__pagination"
          ref={paginationRef}
        />
      )}


      <Button
        ref={nextRef}
        className="slider-navigation__arrow-button slider-navigation__arrow-button--next"
        mode="accent"
        iconName={iconNameRight}
        label="Next slide"
        isLabelHidden
      />


      {paginationPosition === 'bottom' && (
        <div
          className="slider-navigation__pagination"
          ref={paginationRef}
        />
      )}

    </div>
  )
}


export default SliderNavigation