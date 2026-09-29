import { Link } from "react-router-dom";
import { FaClock } from "react-icons/fa";
import { Rating } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import AskAIModal from "./AskAIModal";
import axios from "axios";

// Embedded Safe Image Parser
const getSafeImg = (imgRef) => {
  let path = Array.isArray(imgRef) ? imgRef[0] : imgRef;
  if (path && typeof path === 'object' && path.url) path = path.url;
  if (!path || typeof path !== "string" || path === "null") return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";
  return path.startsWith("http") ? path : `https://travelease-backend-mwq0.onrender.com/images/${path}`;
};

const SingleCard = ({ packageData }) => {
  const [showModal, setShowModal] = useState(false);
  const [aiReply, setAIReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (question) => {
    setLoading(true);
    try {
      const res = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        method: "post", data: { contents: [{ parts: [{ text: question }] }] },
      });
      setAIReply(res.data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer from AI.");
    } catch (error) { setAIReply("Something went wrong!"); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-[260px] h-[360px] mx-auto flex flex-col border rounded-lg overflow-hidden shadow-md bg-white transition-transform duration-300 hover:scale-105">
      <Link to={`/package/${packageData?._id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="w-full h-40 bg-gray-100 overflow-hidden">
        <img src={getSafeImg(packageData?.packageImages)} alt={packageData?.packageName || "Package"} className="w-full h-full object-cover" />
      </Link>

      <div className="p-3 flex flex-col items-start gap-1 flex-1">
        <p className="text-sm text-[#717171]">{packageData?.packageDestination}</p>
        <h2 className="text-[#05073C] text-lg font-semibold line-clamp-1">{packageData?.packageName}</h2>

        {(+packageData?.packageDays > 0 || +packageData?.packageNights > 0) && (
          <p className="flex text-sm items-center gap-2 text-[#717171]">
            <FaClock />
            {+packageData?.packageDays > 0 && (+packageData.packageDays > 1 ? packageData.packageDays + " Days" : packageData.packageDays + " Day")}
            {+packageData?.packageDays > 0 && +packageData?.packageNights > 0 && " - "}
            {+packageData?.packageNights > 0 && (+packageData.packageNights > 1 ? packageData.packageNights + " Nights" : packageData.packageNights + " Night")}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 w-full mt-1 text-sm">
          <span className="text-gray-600">From</span>
          {packageData?.offer && packageData?.packageDiscountPrice ? (
            <span className="flex gap-2 items-center">
              <span className="line-through text-gray-500">${packageData.packagePrice}</span>
              <span className="font-semibold text-green-600">${packageData.packageDiscountPrice}</span>
            </span>
          ) : (
            <span className="font-semibold text-green-600">${packageData?.packagePrice}</span>
          )}
        </div>

        {packageData?.packageTotalRatings > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <Rating value={packageData?.packageRating || 0} size="small" readOnly precision={0.1} />
            <span className="text-gray-500 text-sm">({packageData.packageTotalRatings})</span>
          </div>
        )}
      </div>

      <button className="px-6 py-1 bg-[#EB662B] text-white font-medium text-sm" onClick={() => setShowModal(true)}>Ask AI</button>
      <AskAIModal isOpen={showModal} onClose={() => setShowModal(false)} onAsk={handleAsk} reply={aiReply} loading={loading} defaultPrompt={`Tell me about ${packageData?.packageDestination}`} />
    </motion.div>
  );
};
export default SingleCard;