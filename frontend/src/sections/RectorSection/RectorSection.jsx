import './RectorSection.scss'
import clsx from "clsx";
import rectorImage from '@/assets/images/rector_image2.png'
import rectorBackgroundImage from '@/assets/images/rector_bg_image.jpeg'
import Button from "@/components/Button";

const RectorSection = (props) => {
  const {
    className,
  } = props


  return (
    <section
      className={clsx(className, 'rector-section container')}
    
    >
      <div className="rector-section__body">
        <div className="rector-section__image-wrapper">
          <img
            className="rector-section__image"
            src={rectorImage}
            alt=""
            width="406"
            height="472"

          />
        </div>

        <div className="rector-section__content">
          <h2 className="rector-section__title">
            Настоятель <br />Свято-Петро-Павловского храма:
          </h2>
          <div className="rector-section__name">
            <span className="rector-section__fullname">
             Протоиерей Валентин Ковальчук
            </span>

          </div>

          <Button
            className="rector-section__button"
            type="button"
            label="Подробнее"
            mode="accent"
          />

        </div>

        <div className="rector-section__background-image"></div>

      </div>
    </section>
  )
}

export default RectorSection