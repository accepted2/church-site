import './GallerySection.scss'
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import api from "@/api";
import Button from "@/components/Button";
import Slider from "@/components/Slider";
import SliderNavigation from "@/components/Slider/components/SliderNavigation";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";

import "yet-another-react-lightbox/styles.css";

const GallerySection = (props) => {
  const {
    className,
  } = props

  const { t, i18n } = useTranslation()

  const prevRef = useRef(null)
  const nextRef = useRef(null)
  const swiperRef = useRef(null)
  const [photos, setPhotos] = useState([])
  const [videos, setVideos] = useState([])
  const [activeTab, setActiveTab] = useState('photos')
  const paginationRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  // const [playingVideo, setPlayingVideo] = useState(null)
  // const videoRefs = useRef({})

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await api.get('/gallery/media/by-type/')
        setPhotos(response.data.photos)
        setVideos(response.data.videos)
      } catch (error) {
        console.error('Ошибка загрузки галереи', error)
      }
    }
    fetchMedia()
  }, [i18n.language]);
  const firstFourPhotos = photos.slice(0, 4)
  const sliderPhotos = photos.slice(4)

  const mediaSlides = [
    ...photos.map((photo) => ({
      type: "image",
      src: photo.file_url,
    })),

    ...videos.map((video) => ({
      type: "video",
      width: 1280,
      height: 720,
      poster: video.thumbnail_url,

      sources: [
        {
          src: video.file_url,
          type: "video/mp4",
        },
      ],
    })),
  ]

  const openMedia = (type, id) => {
    let mediaIndex

    if (type === 'photo') {
      mediaIndex = photos.findIndex(
        photo => photo.id === id
      )
    } else {
      mediaIndex =
        photos.length +
        videos.findIndex(
          video => video.id === id
        )
    }

    setIndex(mediaIndex)
    setOpen(true)
  }

  // const toggleVideo = (id) => {
  //
  //   const video = videoRefs.current[id]
  //
  //   if (!video) {
  //     return
  //   }
  //
  //   if (video.paused) {
  //     video.play()
  //     setPlayingVideo(id)
  //
  //   } else {
  //
  //     video.pause()
  //     setPlayingVideo(null)
  //   }
  //
  // }


  const currentSliderData = activeTab === 'photos' ? sliderPhotos : videos
  const currentRightData = activeTab === 'photos' ? firstFourPhotos : currentSliderData
  // const lightboxSlides = photos.map((photo) => ({
  //   src: photo.file_url,
  // }))

  return (
    <section
      className={clsx(className, 'gallery-section container')}
    >
      <div className="gallery-section__inner">
        <div className="gallery-section__header">
          <h2 className="gallery-section__title">
            Фото и Видео Храма
          </h2>
          <div className="gallery-section__description">
            <p>Моменты Богослужений, праздников и жизни прихода</p>
          </div>
        </div>
        <div className="gallery-section__tabs">
          <Button
            label="Фото"
            onClick={() => setActiveTab('photos')}
            className={clsx('gallery-section__button', activeTab === 'photos' ? 'active' : '')}
          />
          <Button
            label="Видео"
            onClick={() => setActiveTab('videos')}
            className={clsx('gallery-section__button',
              activeTab === 'videos' ? 'active' : '')}
          />
        </div>

        {activeTab === 'photos' ? (
          <div className="gallery-section__body">

            <div className="gallery-section__slider-wrapper">

              <div className="gallery-section__slider">
                <Slider
                  prevRef={prevRef}
                  nextRef={nextRef}
                  paginationRef={paginationRef}
                  initialSlide={2}
                  slidesPerView={"auto"}
                  slidesPerGroup={1}
                  effect="coverflow"
                  centeredSlides={true}
                  grabCursor={true}
                  coverflowEffect={{
                    rotate: 35,
                    stretch: 0,
                    depth: 150,
                    modifier: 1,
                    scale: 0.85,
                    slideShadows: true,
                  }}

                  onSwiper={(swiper) => {
                    swiperRef.current = swiper
                  }}
                >
                  {currentSliderData.map((item) => (
                    <div
                      key={item.id}
                      className="gallery-slide"
                    >
                      {item.media_type === 'photo' ? (
                        <img
                          src={item.file_url}
                          alt={item.title}
                          loading="lazy"
                          className="gallery-slide__photo"
                          onClick={() => {
                            openMedia('photo', item.id)
                          }}
                        />
                      ) : (
                        <video
                          controls
                          poster={item.thumbnail_url}
                          src={item.file_url}
                        />
                      )}
                    </div>


                  ))}
                </Slider>
              </div>
              <div className="gallery-section__navigation hidden-mobile-s">

                <Button
                  ref={prevRef}
                  className="gallery-section__arrow gallery-section__arrow--prev"
                  mode="accent"
                  iconName="arrow-straight-left"
                  label="Previous slide"
                  isLabelHidden
                />

                <Button
                  ref={nextRef}
                  className="gallery-section__arrow gallery-section__arrow--next"
                  mode="accent"
                  iconName="arrow-straight-right"
                  label="Next slide"
                  isLabelHidden
                />

              </div>


              <div
                ref={paginationRef}
                className="gallery-section__pagination"
              />

            </div>

            <div className="gallery-section__photos">
              <div className="gallery-photos__grid">
                {currentRightData.map((photo) => (
                  <div
                    key={photo.id}
                    className="gallery-photos__item"
                    onClick={() => openMedia('photo', photo.id)}
                  >
                    <img
                      src={photo.file_url}
                      alt={photo.title}

                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="gallery-section__videos">

            {videos.map((video) => (
              <div className=" gallery-video__wrapper ">
                <div
                  key={video.id}
                  className="gallery-video"
                  onClick={() => openMedia('video', video.id)}
                >
                  <img
                    src={video.thumbnail_url}
                    alt=""
                    loading="lazy"
                  />

                  <span className="gallery-video__play">▶</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="gallery-section__statistics">
          <div className="gallery-section__statistics-wrapper">
            <div className="gallery-section__statistics-data">
              <img

                src=""
                alt=""
                width=""
                height=""
                loading="lazy"
              />
              <p className="gallery-section__statistics-amount">150+</p>
              <p className="gallery-section__statistics-label">Фотографий</p>


            </div>
            <div className="gallery-section__statistics-data">
              <img

                src=""
                alt=""
                width=""
                height=""
                loading="lazy"
              />

              <p className="gallery-section__statistics-amount">30+</p>
              <p className="gallery-section__statistics-label">Видеозаписей</p>

            </div>
          </div>
          <Button
            label="Смотреть всю галерею"
            className="gallery-section__all-gallery-button"
            // onClick={}
          />
        </div>


        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={mediaSlides}
          index={index}
          plugins={[Video]}
        />

      </div>
    </section>
  )
}

export default GallerySection