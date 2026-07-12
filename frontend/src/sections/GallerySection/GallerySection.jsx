import './GallerySection.scss'
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import api from "@/api";
import Button from "@/components/Button";
import Slider from "@/components/Slider";
import SliderNavigation from "@/components/Slider/components/SliderNavigation";
import Icon from "@/components/Icon";

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

  // ========== КАСТОМНЫЙ ЛАЙТБОКС ==========
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const openLightbox = (imageUrl, alt) => {
    setSelectedImage({ url: imageUrl, alt })
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setSelectedImage(null)
  }

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

  const currentSliderData = activeTab === 'photos' ? sliderPhotos : videos
  const currentRightData = activeTab === 'photos' ? firstFourPhotos : currentSliderData

  return (
    <section
      className={clsx(className, 'gallery-section container')}
      id="gallery"
    >
      <div className="gallery-section__inner">
        <div className="gallery-section__header">
          <h2 className="gallery-section__title">
            {t('gallery.title')}
          </h2>
          <div className="gallery-section__description">
            <p>{t('gallery.description')}</p>
          </div>
        </div>

        <div className="gallery-section__tabs">
          <Button
            label={t('gallery.photos')}
            onClick={() => setActiveTab('photos')}
            className={clsx('gallery-section__button', activeTab === 'photos' ? 'active' : '')}
          />
          <Button
            label={t('gallery.videos')}
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
                          onClick={() => openLightbox(item.file_url, item.title)}
                          style={{ cursor: 'pointer' }}
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
                    onClick={() => openLightbox(photo.file_url, photo.title)}
                    style={{ cursor: 'pointer' }}
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
              <div
                key={video.id}
                className="gallery-video__wrapper"
              >
                <div
                  className="gallery-video"
                  onClick={() => openLightbox(video.thumbnail_url, video.title)}
                  style={{ cursor: 'pointer' }}
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
              <Icon
                name="image-icon"
                iconClassName="gallery-section__statistics-image"
              />
              <div className="gallery-section__statistics-content">
                <p className="gallery-section__statistics-amount">150</p>
                <p className="gallery-section__statistics-label">{t('gallery.statistics.photos')}</p>
              </div>
            </div>
            <div className="gallery-section__statistics-data">
              <Icon
                name="video-icon"
                iconClassName="gallery-section__statistics-image"
              />
              <div className="gallery-section__statistics-content">
                <p className="gallery-section__statistics-amount">30</p>
                <p className="gallery-section__statistics-label">{t('gallery.statistics.videos')}</p>
              </div>
            </div>
          </div>
          <Button
            label={t('gallery.watch_all')}
            className="gallery-section__all-gallery-button"
            iconName="image-icon2"
            iconPosition="before"
          />
        </div>

        {/* ========== КАСТОМНЫЙ ЛАЙТБОКС ========== */}
        {lightboxOpen && selectedImage && (
          <div
            className="gallery-section__lightbox"
            onClick={closeLightbox}
          >
            <span className="gallery-section__lightbox-close">&times;</span>
            <img
              className="gallery-section__lightbox-image"
              src={selectedImage.url}
              alt={selectedImage.alt}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </section>
  )
}

export default GallerySection