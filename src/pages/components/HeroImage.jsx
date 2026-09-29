import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// 1. Stunning Default Fallback Images
const defaultSlides = [
  { id: "d1", title: "Explore Cox's Bazar", location: "COX'S BAZAR", image: "https://images.unsplash.com/photo-1608958435020-e8531a70ea01?auto=format&fit=crop&w=1200&q=80" },
  { id: "d2", title: "Discover Sylhet", location: "SYLHET", image: "https://images.unsplash.com/photo-1590050752112-9bd87af0a365?auto=format&fit=crop&w=1200&q=80" },
  { id: "d3", title: "Journey to Bandarban", location: "BANDARBAN", image: "https://images.unsplash.com/photo-1589136780362-e64e525a818c?auto=format&fit=crop&w=1200&q=80" },
  { id: "d4", title: "Experience Sajek Valley", location: "RANGAMATI", image: "https://images.unsplash.com/photo-1579282530030-9db078170c8a?auto=format&fit=crop&w=1200&q=80" },
  { id: "d5", title: "Venture to Sundarbans", location: "KHULNA", image: "https://images.unsplash.com/photo-1622396112959-19c2ff1b606c?auto=format&fit=crop&w=1200&q=80" }
];

// 2. Crash-Proof Cloudinary Parser
const getSafeImg = (imgRef) => {
  let path = Array.isArray(imgRef) ? imgRef[0] : imgRef;
  if (path && typeof path === 'object' && path.url) path = path.url;
  if (!path || typeof path !== "string" || path === "null") return null; // Returns null so the fallback image takes over
  return path.startsWith("http") ? path : `https://travelease-backend-mwq0.onrender.com/images/${path}`;
};

const HeroImage = () => {
  // Initialize with beautiful defaults so the page is never blank
  const [slides, setSlides] = useState(defaultSlides);

  useEffect(() => {
    let cancelled = false;
    
    const loadDynamicPackages = async () => {
      try {
        // Fetch only the 5 latest packages to keep the homepage lightning fast
        const res = await fetch("/api/package/get-packages?limit=5&sort=createdAt&order=desc");
        const data = await res.json();
        
        if (data?.success && data?.packages?.length > 0 && !cancelled) {
          const dynamicSlides = data.packages.map((pkg, index) => {
            const cloudinaryUrl = getSafeImg(pkg.packageImages);
            const fallbackSlide = defaultSlides[index % defaultSlides.length];

            return {
              id: pkg._id,
              title: pkg.packageName || fallbackSlide.title,
              location: (pkg.packageDestination || pkg.placeName || fallbackSlide.location).toUpperCase(),
              // If Cloudinary succeeds, use it. If it fails, keep the beautiful default image.
              image: cloudinaryUrl || fallbackSlide.image 
            };
          });
          setSlides(dynamicSlides);
        }
      } catch (error) { 
        console.error("Dynamic fetch failed, defaulting to stable imagery.", error); 
      }
    };

    loadDynamicPackages();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="w-full my-6 px-4 md:px-8 relative z-0">
      <Swiper 
        modules={[Navigation, Pagination, Autoplay]} 
        navigation 
        pagination={{ clickable: true }} 
        autoplay={{ delay: 4500, disableOnInteraction: false }} 
        loop={true} 
        className="w-full h-[420px] md:h-[500px] rounded-2xl shadow-2xl overflow-hidden bg-slate-900"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id || index}>
            <div className="relative w-full h-full bg-slate-900 group">
              
              {/* Image with fallback error handler */}
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105" 
                onError={(e) => { e.currentTarget.src = defaultSlides[index % defaultSlides.length].image; }} 
              />
              
              {/* Beautiful Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-8 md:p-14">
                <div className="flex flex-col gap-2 max-w-3xl transform transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                  <span className="text-yellow-400 text-xs md:text-sm font-black tracking-[0.2em] uppercase drop-shadow-md">
                    {slide.location}
                  </span>
                  <h2 className="text-white text-3xl md:text-5xl font-extrabold drop-shadow-lg leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-gray-200 text-sm md:text-base font-medium mt-2 drop-shadow">
                    Discover incredible destinations and unforgettable experiences with TravelEase.
                  </p>
                </div>
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroImage;