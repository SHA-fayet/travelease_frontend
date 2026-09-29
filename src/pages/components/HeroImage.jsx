import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import hero_image from "../../assets/images/hero_img.png";
import hero_image2 from "../../assets/images/hero_img2.png";
import hero_image3 from "../../assets/images/hero_img3.png";

const getImageDimensions = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight, area: img.naturalWidth * img.naturalHeight });
    img.onerror = () => resolve(null);
  });
};

const HeroImage = () => {
  const [slides, setSlides] = useState([
    { id: "f1", title: "Explore Inani Beach", location: "COX'S BAZAR", image: hero_image },
    { id: "f2", title: "Discover Sajek", location: "RANGAMATI", image: hero_image2 },
    { id: "f3", title: "Experience Tanguar Haor", location: "SUNAMGANJ", image: hero_image3 },
  ]);

  useEffect(() => {
    let cancelled = false;
    const scan52DatasetClasses = async () => {
      try {
        const res = await fetch("/api/package/get-packages?limit=100");
        const data = await res.json();
        if (data?.success && data?.packages?.length > 0 && !cancelled) {
          const classBestImages = {};
          for (const pkg of data.packages) {
            if (!pkg.packageImages || pkg.packageImages.length === 0) continue;
            const classKey = (pkg.placeName || pkg.packageDestination || pkg.district || "unknown").trim().toLowerCase();

            for (const imgName of pkg.packageImages) {
              // 100% CRASH PROOF CHECK - Stops the null.startsWith error
              if (!imgName || typeof imgName !== 'string' || imgName === 'null') continue;

              const imageUrl = imgName.startsWith("http") ? imgName : `https://travelease-backend-mwq0.onrender.com/images/${imgName}`;
              const dims = await getImageDimensions(imageUrl);
              if (dims && dims.width > dims.height) {
                if (!classBestImages[classKey] || dims.area > classBestImages[classKey].area) {
                  classBestImages[classKey] = {
                    id: pkg._id, title: `Explore ${pkg.placeName || pkg.packageName}`, location: `${pkg.district || "Bangladesh"}`.toUpperCase(), image: dims.url, area: dims.area,
                  };
                }
              }
            }
          }
          const sorted = Object.values(classBestImages).sort((a, b) => b.area - a.area);
          if (sorted.length > 0 && !cancelled) setSlides(sorted.slice(0, 5));
        }
      } catch (error) { console.error("Error scanning 52 dataset classes:", error); }
    };
    scan52DatasetClasses();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="w-full my-6 px-4 md:px-8">
      <Swiper modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} autoplay={{ delay: 4500 }} loop={slides.length > 1} className="w-full h-[420px] md:h-[480px] rounded-2xl shadow-2xl overflow-hidden bg-slate-900">
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id || index}>
            <div className="relative w-full h-full bg-slate-900">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = hero_image; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-8 md:p-12">
                <div className="flex flex-col gap-1">
                  <span className="text-yellow-400 text-xs md:text-sm font-bold tracking-widest uppercase drop-shadow">{slide.location}</span>
                  <h2 className="text-white text-2xl md:text-4xl font-extrabold drop-shadow-lg">{slide.title}</h2>
                  <p className="text-gray-200 text-xs md:text-sm font-medium mt-1">Discover Bangladesh destinations with TravelEase.</p>
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