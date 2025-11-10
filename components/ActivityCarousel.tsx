import React, { useState, useEffect } from 'react';
import Image from 'next/image';
// @ts-ignore - Swiper types may not be fully compatible
import { Swiper, SwiperSlide } from 'swiper/react';
// @ts-ignore
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  image: string;
  location?: string | null;
  link?: string | null;
}

interface ActivityCarouselProps {
  items: ActivityItem[];
  autoplayDelay?: number;
}

export default function ActivityCarousel({ items, autoplayDelay = 5000 }: ActivityCarouselProps) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedActivity(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedActivity) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedActivity]);

  // Handle empty items - should not render carousel
  if (!items || items.length === 0) {
    return null;
  }

  // Always enable loop for multiple items (like Coca-Cola website)
  const shouldLoop = items.length > 1;
  
  return (
    <>
      <div className="activity-carousel relative px-10">
        {/* Custom Navigation Buttons - Only show if more than 1 item */}
        {items.length > 1 && (
          <>
            <button
              className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-primary-50 transition-colors"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-primary-50 transition-colors"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={16}
        slidesPerView={1}
        slidesPerGroup={1}
        speed={600}
        navigation={{
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination-custom',
        }}
        autoplay={items.length > 1 ? {
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        } : false}
        loop={shouldLoop}
        grabCursor={true}
        simulateTouch={true}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 16,
            slidesPerGroup: 1,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 16,
            slidesPerGroup: 1,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 16,
            slidesPerGroup: 1,
          },
        }}
        className="py-4"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <div 
              className="activity-card group cursor-pointer"
              onClick={() => setSelectedActivity(item)}
            >
              <ActivityCard item={item} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination - Only show if more than 1 item */}
      {items.length > 1 && (
        <div className="swiper-pagination-custom flex justify-center gap-2 mt-6"></div>
      )}

      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 activity-modal-overlay"
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative activity-modal-content"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedActivity(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Full Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] bg-gradient-to-br from-primary-50 to-sage-50">
              <Image
                src={selectedActivity.image}
                alt={selectedActivity.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-800 mb-4">
                {selectedActivity.title}
              </h2>
              
              {/* Location */}
              {selectedActivity.location && (
                <div className="flex items-center gap-2 text-neutral-600 mb-4">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-base">{selectedActivity.location}</span>
                </div>
              )}
              
              <p className="text-lg text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {selectedActivity.description}
              </p>
              
              {/* Link Button */}
              {selectedActivity.link && (
                <div className="mt-6">
                  <a
                    href={selectedActivity.link}
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Learn More</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .activity-carousel .swiper-pagination-custom .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s;
        }
        .activity-carousel .swiper-pagination-custom .swiper-pagination-bullet-active {
          background: #8b7355;
          width: 32px;
          border-radius: 6px;
        }
        
        .activity-modal-overlay {
          animation: fadeIn 0.3s ease-out;
        }
        
        .activity-modal-content {
          animation: scaleIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-[450px]">
      {/* Image - Fixed height */}
      <div className="relative h-64 overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.title}
          width={800}
          height={600}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content - Fixed height with ellipsis */}
      <div className="p-6 h-[186px] flex flex-col">
        <h3 className="text-xl font-serif font-bold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {item.title}
        </h3>
        
        {/* Location if exists */}
        {item.location && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{item.location}</span>
          </div>
        )}
        
        <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3 overflow-hidden flex-1">
          {item.description}
        </p>
      </div>
    </div>
  );
}

