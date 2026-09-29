import React from "react";
import { Link } from "react-router-dom";
import { FaClock } from "react-icons/fa";
import { getImageUrl } from "../../utils/media";

const Offers = ({ packageData }) => {
  const imgSrc = getImageUrl(packageData);

  return (
    <div className="w-full mx-auto flex flex-col border rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition">
      <Link to={`/package/${packageData?._id}`} className="w-full h-40 bg-gray-100 overflow-hidden block">
        <img src={imgSrc} alt={packageData?.packageName || "Special Offer"} className="w-full h-full object-cover" />
      </Link>
      <div className="p-4 flex flex-col items-center text-center gap-1">
        <p className="text-gray-500 font-bold line-through text-sm">৳ {packageData?.packagePrice}</p>
        <p className="text-[#EB662B] font-black text-lg">৳ {packageData?.packageDiscountPrice}</p>
        <h2 className="text-[#05073C] text-md font-bold mt-1 line-clamp-1 hover:text-[#EB662B] transition">
          <Link to={`/package/${packageData?._id}`}>{packageData?.packageName}</Link>
        </h2>
        <p className="text-sm text-gray-500">{packageData?.packageDestination}</p>
        <p className="flex text-xs items-center justify-center gap-1 text-gray-600 font-semibold mt-2">
          <FaClock className="text-[#EB662B]" /> {packageData?.packageDays} Days - {packageData?.packageNights} Nights
        </p>
      </div>
    </div>
  );
};
export default Offers;