import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import all images from the carrossel folder
const images = import.meta.glob('../assets/carrossel/*.{png,jpg,jpeg,JPG}', { eager: true, query: '?url', import: 'default' });
const imageList = Object.values(images);

const CarouselSection = () => {
    return (
        <section className="py-24 bg-academic-brown relative">
            {/* Background texture for street feel */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
            </div>

            <div className="container mx-auto px-4 z-10 relative">
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-center text-academic-light mb-16 uppercase tracking-wider drop-shadow-lg">
                    Encruzilhadas educacionais: <br />
                    <span className="text-academic-pink block mt-2">por onde ando e por onde andei</span>
                </h2>

                <Swiper
                    effect={'coverflow'}
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView={'auto'}
                    loop={true}
                    coverflowEffect={{
                        rotate: 0,
                        stretch: 0,
                        depth: 200,
                        modifier: 1,
                        slideShadows: true,
                    }}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    }}
                    pagination={{ clickable: true }}
                    modules={[EffectCoverflow, Autoplay, Pagination]}
                    className="w-full py-12"
                >
                    {imageList.map((img, index) => (
                        <SwiperSlide key={index} className="!w-80 !h-[450px] md:!w-[400px] md:!h-[500px]">
                            <div className="w-full h-full p-2 bg-academic-light/10 rounded-xl backdrop-blur-sm border border-academic-light/20 shadow-2xl transform transition-transform hover:scale-105">
                                <img
                                    src={img}
                                    alt={`Momento ${index + 1}`}
                                    className="block w-full h-full object-cover rounded-lg filter sepia-[.2] contrast-125"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="text-center mt-8 text-academic-light/40 text-sm font-sans">
                    (Passe o mouse para pausar / Arraste para navegar)
                </div>
            </div>
        </section>
    );
};

export default CarouselSection;
