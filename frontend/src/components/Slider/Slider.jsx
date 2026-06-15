import 'swiper/css'
import './Slider.scss'
import clsx from "clsx";
import 'swiper/css/effect-coverflow'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules'
import { useEffect, useRef } from "react";

const Slider = (props) => {
  const {
    className,
    children,
    prevRef,
    nextRef,
    initialSlide,
    paginationRef,
    onSwiper,
    grabCursor,
    centeredSlides = false,
    slidesPerView = 1,
    slidesPerGroup = 4,
    effect = 'slide',
    coverflowEffect = {}
  } = props

  const swiperInstance = useRef(null)

  const defaultCoverflowEffect = {
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  }

  useEffect(() => {

    const swiper = swiperInstance.current

    if (!swiper) return


    swiper.params.navigation.prevEl = prevRef.current
    swiper.params.navigation.nextEl = nextRef.current


    swiper.params.pagination.el = paginationRef.current


    swiper.navigation.destroy()

    swiper.navigation.init()

    swiper.navigation.update()


    swiper.pagination.destroy()

    swiper.pagination.init()

    swiper.pagination.render()

    swiper.pagination.update()


  }, [
    prevRef.current,
    nextRef.current,
    paginationRef.current
  ])

  return (
    <div
      className={clsx(className, 'slider')}
    >
      <Swiper
        modules={[Navigation, Pagination, EffectCoverflow]}
        spaceBetween={20}
        slidesPerView={slidesPerView}
        slidesPerGroup={slidesPerGroup}
        initialSlide={initialSlide}
        watchOverflow={true}
        centerInsufficientSlides={true}
        centeredSlides={centeredSlides}
        onSwiper={(swiper) => {

          swiperInstance.current = swiper

          onSwiper?.(swiper)

        }}
        grabCursor={grabCursor}
        effect={effect}
        coverflowEffect={effect === 'coverflow' ?
          { ...defaultCoverflowEffect, ...coverflowEffect }
          : undefined}

        // loop={effect === 'coverflow'}

        pagination={{

          clickable: true,
        }}

        onBeforeInit={(swiper) => {

          swiper.params.navigation.prevEl = prevRef.current
          swiper.params.navigation.nextEl = nextRef.current

          swiper.params.pagination.el = paginationRef.current

        }}
        breakpoints={

          effect === 'coverflow'
            ? {}
            :
            {
              0: {
                slidesPerView: 1,
                slidesPerGroup: 1,
              },
              768: {
                slidesPerView: 1,
                spaceBetween: 20,
                slidesPerGroup: 2
              },
              1024: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 40
              },
              1440: {
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 20
              },
            }}
      >
        {children.map((child) => (
          <SwiperSlide key={child.key}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  )
}

export default Slider