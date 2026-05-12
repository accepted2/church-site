import 'swiper/css'
import './Slider.scss'
import clsx from "clsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from 'swiper/modules'

const Slider = (props) => {
  const {
    className,
    children,
    prevRef,
    nextRef,
    initialSlide,
    onSwiper,
  } = props

  return (
    <div
      className={clsx(className, 'slider')}
    >
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        slidesPerGroup={4}
        initialSlide={initialSlide}
        watchOverflow={true}
        centerInsufficientSlides={true}
        onSwiper={onSwiper}

        pagination={{
          el: '.slider-navigation__pagination',
          clickable: true,
        }}

        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current
          swiper.params.navigation.nextEl = nextRef.current
          swiper.navigation.init()
          swiper.navigation.update()
          //
          // swiper.pagination.init()
          // swiper.pagination.update()
        }}
        breakpoints={{
          0: {
            slidesPerView: 1,
            slidesPerGroup: 1,
          },
          768: {
            slidesPerView: 2,
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