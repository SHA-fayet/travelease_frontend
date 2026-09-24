import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCloudUploadAlt, FaCamera, FaMapMarkerAlt, FaSpinner, FaSuitcase, FaHotel } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ImageSearchModal = ({ isOpen, onClose }) => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const handleSearch = async () => {
    if (!imageFile) return toast.error("Please upload an image first!");

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/ai/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setResults(data);
      } else {
        toast.error(data.message || "Could not identify this destination.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error communicating with AI vision engine.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetModal = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResults(null);
    setIsAnalyzing(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#05073C] p-6 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-[#EB662B] p-2.5 rounded-xl text-white">
                <FaCamera size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-wider">Destination Identifier</h2>
                <p className="text-xs text-gray-300">Upload a picture to find the place & its tour packages</p>
              </div>
            </div>
            <button onClick={() => { resetModal(); onClose(); }} className="text-gray-400 hover:text-white transition">
              <FaTimes size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
            {!results ? (
              <div className="flex flex-col items-center py-4">
                <p className="text-gray-600 text-center mb-6 max-w-md font-medium text-sm">
                  Upload any photo of a tourist spot in Bangladesh. The trained vision model will identify the place and pull up all available tour packages.
                </p>

                {/* Upload Box */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => !isAnalyzing && fileInputRef.current.click()}
                  className={`w-full max-w-lg h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition overflow-hidden relative ${
                    previewUrl ? "border-[#EB662B] bg-orange-50/50" : "border-gray-300 bg-white hover:border-[#6358DC] hover:bg-indigo-50/30"
                  }`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />

                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-75" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="bg-black/80 text-white px-4 py-2 rounded-xl font-bold text-xs">
                          Click to choose another photo
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt size={56} className="text-[#EB662B] mb-3" />
                      <p className="font-bold text-gray-700 text-base">Select or drop a photo here</p>
                      <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>

                <button 
                  onClick={handleSearch}
                  disabled={!imageFile || isAnalyzing}
                  className="mt-6 bg-[#EB662B] text-white px-8 py-3.5 rounded-2xl font-black text-sm tracking-wider hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <><FaSpinner className="animate-spin" size={18} /> IDENTIFYING DESTINATION...</>
                  ) : (
                    "FIND DESTINATION & PACKAGES"
                  )}
                </button>
              </div>
            ) : (
              /* Detection Results View */
              <div>
                <div className="flex flex-col md:flex-row gap-5 mb-6 items-center bg-white p-5 rounded-2xl border shadow-sm">
                  <img src={previewUrl} alt="Uploaded" className="w-28 h-28 object-cover rounded-xl border-2 border-gray-100" />
                  <div className="text-center md:text-left">
                    <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Identified Location</span>
                    <h3 className="text-2xl font-black text-[#05073C] flex items-center justify-center md:justify-start gap-2 mt-1">
                      <FaMapMarkerAlt className="text-[#EB662B]" /> {results.location}
                    </h3>
                    <p className="text-xs font-bold text-green-600 mt-1">
                      Match Confidence: {(results.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Tour Packages Available */}
                <h4 className="font-black text-gray-800 text-base mb-3 flex items-center gap-2">
                  <FaSuitcase className="text-[#6358DC]" /> Available Tour Packages for {results.location}
                </h4>

                {results.data.packages?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {results.data.packages.map((pkg) => (
                      <Link 
                        to={`/package/${pkg._id}`} 
                        onClick={onClose} 
                        key={pkg._id} 
                        className="bg-white border p-3 rounded-xl flex gap-3 hover:shadow-md transition group"
                      >
                        <img 
                          src={pkg.packageImages?.[0] ? `http://localhost:8000/images/${pkg.packageImages[0]}` : "https://via.placeholder.com/150"} 
                          alt={pkg.packageName} 
                          className="w-16 h-16 object-cover rounded-lg" 
                        />
                        <div className="flex flex-col justify-center">
                          <h5 className="font-bold text-sm text-gray-900 group-hover:text-[#EB662B] transition line-clamp-1">
                            {pkg.packageName}
                          </h5>
                          <p className="text-xs font-black text-[#6358DC] mt-0.5">৳ {pkg.packagePrice}</p>
                          <p className="text-[11px] text-gray-500">{pkg.packageDays} Days / {pkg.packageNights} Nights</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mb-6 italic bg-white p-3 rounded-xl border">
                    No packaged tours listed yet for this destination.
                  </p>
                )}

                {/* Available Hotels */}
                <h4 className="font-black text-gray-800 text-base mb-3 flex items-center gap-2">
                  <FaHotel className="text-[#EB662B]" /> Available Hotels in {results.location}
                </h4>

                {results.data.hotels?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.data.hotels.map((hotel) => (
                      <Link 
                        to="/services" 
                        onClick={onClose} 
                        key={hotel._id} 
                        className="bg-white border p-3 rounded-xl flex gap-3 hover:shadow-md transition group"
                      >
                        <img 
                          src={hotel.images?.[0]?.startsWith("http") ? hotel.images[0] : `http://localhost:8000/images/${hotel.images?.[0]}`} 
                          alt={hotel.name} 
                          className="w-16 h-16 object-cover rounded-lg" 
                        />
                        <div className="flex flex-col justify-center">
                          <h5 className="font-bold text-sm text-gray-900 group-hover:text-[#EB662B] transition line-clamp-1">
                            {hotel.name}
                          </h5>
                          <p className="text-xs font-black text-emerald-600 mt-0.5">
                            ৳ {hotel.pricePerNight} <span className="text-[10px] text-gray-400">/night</span>
                          </p>
                          <p className="text-[11px] text-gray-500">{hotel.roomType}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic bg-white p-3 rounded-xl border">
                    No independent hotels listed yet for this destination.
                  </p>
                )}

                <div className="mt-6 text-center">
                  <button onClick={() => setResults(null)} className="text-xs font-bold text-gray-500 hover:text-gray-800 underline">
                    Upload another photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageSearchModal;