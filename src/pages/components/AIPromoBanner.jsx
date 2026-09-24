import React, { useState } from "react";
import { FaCameraRetro, FaMagic } from "react-icons/fa";
import ImageSearchModal from "./ImageSearchModal";

const AIPromoBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
      <div className="bg-gradient-to-br from-[#05073C] via-[#1a1c5b] to-[#6358DC] rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#EB662B] opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>

        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-orange-400 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-white/10">
            <FaMagic /> Visual Discovery AI
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            Confused about a place? <br className="hidden md:block"/>
            <span className="text-[#EB662B]">Upload a photo.</span>
          </h2>
          <p className="text-indigo-100 text-sm md:text-base max-w-xl font-medium">
            Don't know the name of that beautiful destination? Just drop a picture. Our AI model will detect the place and find all matching tour packages and hotels.
          </p>
        </div>

        <div className="z-10 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-[#EB662B] text-white px-7 py-4 rounded-2xl font-black text-base transition-all duration-300 shadow-lg hover:bg-orange-600 flex items-center justify-center gap-3"
          >
            <FaCameraRetro size={20} />
            Try Image Search
          </button>
        </div>
      </div>

      <ImageSearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default AIPromoBanner;