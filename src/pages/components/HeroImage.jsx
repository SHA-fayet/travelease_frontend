import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// 1. Stunning Default Fallback Images
const defaultSlides = [
  { id: "d1", title: "Explore Cox's Bazar", location: "COX'S BAZAR", image: "https://th.bing.com/th/id/R.0717198bc54a06cfad0ea0b5d778db6e?rik=50HUv3EmdxU76A&pid=ImgRaw&r=0" },
  { id: "d2", title: "Discover Sylhet", location: "SYLHET", image: "https://tse2.mm.bing.net/th/id/OIP.n8wSf9WGDCks9U4guCZCsAHaD4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: "d3", title: "Journey to Bandarban", location: "BANDARBAN", image: "https://media-cdn.tripadvisor.com/media/photo-c/1280x250/0d/77/22/14/amiakhum.jpg" },
  { id: "d4", title: "Experience Sajek Valley", location: "RANGAMATI", image: "https://th.bing.com/th/id/R.b631993654601ca6cd2a635b5a7c3369?rik=cU%2fzh5GkDUH53Q&riu=http%3a%2f%2f4.bp.blogspot.com%2f-jHJjkqqR_Fo%2fVpNHJV0YQbI%2fAAAAAAAAAII%2fv8GDqLnjIM4%2fs1600%2fRangamati.jpg&ehk=fP%2bi00MpD2RoNdEFd1pJRNgoRJyd%2fu%2b8l11W5psIDFk%3d&risl=&pid=ImgRaw&r=0" },
  { id: "d5", title: "Venture to Sundarbans", location: "KHULNA", image: "https://tse1.mm.bing.net/th/id/OIP.llb9Nq_0w6JCMWUrV1jImAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" }
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