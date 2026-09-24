import { Link } from "react-router-dom";
import { FaClock } from "react-icons/fa";
import { Rating } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import AskAIModal from "./AskAIModal";
import axios from "axios";
const SingleCard = ({ packageData }) => {
  const [showModal, setShowModal] = useState(false);
  const [aiReply, setAIReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [defaultPrompt, setDefaultPrompt] = useState("");

  const handleAsk = async (question) => {
    setLoading(true);
    try {
      const res = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        method: "post",
        data: {
          contents: [
            {
              parts: [{ text: question }],
            },
          ],
        },
      });
      const response = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAIReply(response || "No answer from AI.");
    } catch (error) {
      console.log(error);
      setAIReply("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-[260px] h-[360px] mx-auto flex flex-col border rounded-lg overflow-hidden shadow-md bg-white transition-transform duration-300 hover:scale-105"
    >
      {/* Top Image Section */}
      <Link
        to={`/package/${packageData._id}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
      <img 
        src={
          packageData?.packageImages[0]?.startsWith("http") 
            ? packageData.packageImages[0] 
            : `http://localhost:8000/images/${packageData.packageImages[0]}`
        } 
        alt="Package Image" 
       
      />
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col items-start gap-1 flex-1">
        <p className="text-sm text-[#717171]">
          {packageData.packageDestination}
        </p>

        <h2 className="text-[#05073C] text-lg font-semibold">
          {packageData.packageName}
        </h2>

        <p className="text-sm text-[#717171]">{packageData.packageDuration}</p>

        {/* Duration */}
        {(+packageData.packageDays > 0 || +packageData.packageNights > 0) && (
          <p className="flex text-sm items-center gap-2 text-[#717171]">
            <FaClock />
            {+packageData.packageDays > 0 &&
              (+packageData.packageDays > 1
                ? packageData.packageDays + " Days"
                : packageData.packageDays + " Day")}
            {+packageData.packageDays > 0 &&
              +packageData.packageNights > 0 &&
              " - "}
            {+packageData.packageNights > 0 &&
              (+packageData.packageNights > 1
                ? packageData.packageNights + " Nights"
                : packageData.packageNights + " Night")}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between gap-2 w-full mt-1 text-sm">
          <span className="text-gray-600">From</span>
          {packageData.offer && packageData.packageDiscountPrice ? (
            <span className="flex gap-2 items-center">
              <span className="line-through text-gray-500">
                ${packageData.packagePrice}
              </span>
              <span className="font-semibold text-green-600">
                ${packageData.packageDiscountPrice}
              </span>
            </span>
          ) : (
            <span className="font-semibold text-green-600">
              ${packageData.packagePrice}
            </span>
          )}
        </div>

        {/* Ratings */}
        {packageData.packageTotalRatings > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <Rating
              value={packageData.packageRating}
              size="small"
              readOnly
              precision={0.1}
            />
            <span className="text-gray-500 text-sm">
              ({packageData.packageTotalRatings})
            </span>
          </div>
        )}
      </div>
      <button
        className="px-6 py-1 bg-[#EB662B] text-white"
        onClick={() => {
          setShowModal(true);
          setDefaultPrompt(
            `Tell me about travel tips and places to visit in ${packageData.packageDestination}`
          );
        }}
      >
        Ask AI
      </button>
      <AskAIModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAsk={handleAsk}
        reply={aiReply}
        loading={loading}
        defaultPrompt={defaultPrompt}
      />
    </motion.div>
  );
};
export default SingleCard;
