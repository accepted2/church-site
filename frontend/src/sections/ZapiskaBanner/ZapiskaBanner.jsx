import './ZapiskaBanner.scss'
import clsx from "clsx";
import heroImage from '@/assets/images/hero_image-another.jpg'

const ZapiskaBanner = (props) => {
  const {
    className,
  } = props

  return (
    <section
      className={clsx(className, 'zapiska-banner ')}
    >
      <div className="zapiska-banner__image-wrapper">
        <img
          className="zapiska-banner__image"
          src={heroImage}
          alt=""
          width=""
          height=""
          loading="lazy"
        />
      </div>
      <div className="zapiska-banner__body container">

        <div className="zapiska-banner__content">

          <h1 className="zapiska-banner__title">Подать записку</h1>
          <div className="zapiska-banner__title">
            <p>Вы можете подать записку онлайн <br />
              для поминовения в Свято-Петро-Павловском храме
            </p>
          </div>

        </div>
      </div>
    </section>

  )
}

export default ZapiskaBanner