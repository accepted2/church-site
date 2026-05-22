import './Hero.scss'
import clsx from "clsx";

const Hero = (props) => {
  const {
    className,
  } = props

  return (
    <section
      className={clsx(className, 'hero')}
      id="about"
    >

      <div className="hero__image">
        <div className="hero__bg" />
        <div className="hero__overlay" />
        {/*<div className="hero__overlay-1" />*/}
        {/*<div className="hero__overlay-2" />*/}
      </div>
      <div className="hero__inner container">
        <div className="hero__content">
          <div className="hero__text-wrapper">
            <p className="hero__subtitle">
              Украинская Православная Церковь
            </p>
            <h1 className="hero__title">
              Свято Петро-Павловский
            </h1>
            <p className="hero__church-type">Храм</p>


          </div>
        </div>

      </div>
      {/*<div className="hero__image" />*/}
    </section>
  )
}

export default Hero