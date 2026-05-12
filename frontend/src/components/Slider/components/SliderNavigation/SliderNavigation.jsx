import './SliderNavigation.scss'
import clsx from "clsx";
import Button from "@/components/Button";

const SliderNavigation = (props) => {
  const {
    className,
    prevRef,
    nextRef,
    // id,
    // hasPagination = true,
    /**
     * '' (default) | 'tile'
     */
    mode = ''
  } = props

  return (
    <div
      className={clsx(className, 'slider-navigation', {
        [`slider-navigation--${mode}`]: mode,
      })}
      // id={id}
    >
      <Button
        ref={prevRef}
        className="slider-navigation__arrow-button slider-navigation__arrow-button--previous"
        mode="accent"
        iconName="arrow-left"
        label="Previous slide"
        isLabelHidden
      />

      <div className="slider-navigation__pagination" />

      <Button
        ref={nextRef}
        className="slider-navigation__arrow-button slider-navigation__arrow-button--next"
        mode="accent"
        iconName="arrow-right"
        label="Next slide"
        isLabelHidden
      />
    </div>
  )
}

export default SliderNavigation