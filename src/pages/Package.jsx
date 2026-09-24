import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css/bundle";
import Rating from "@mui/material/Rating";
import { useSelector } from "react-redux";
import RatingCard from "./RatingCard";
import { toast } from "react-toastify";
import MapModal from "./components/MapModal";
import { FaClock, FaArrowRight } from "react-icons/fa";

const Package = () => {
  const [showMap, setShowMap] = useState(false);
  SwiperCore.use([Navigation]);
  
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [ratingsData, setRatingsData] = useState({
    rating: 0,
    review: "",
    packageId: params?.id,
    userRef: currentUser?._id,
    username: currentUser?.username,
    userProfileImg: currentUser?.avatar,
  });
  
  const [packageRatings, setPackageRatings] = useState([]);
  const [ratingGiven, setRatingGiven] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "";
  const imageUrlBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const getPackageData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/package/get-package-data/${params?.id}`);
      const data = await res.json();
      if (data?.success) {
        setPackageData(data.packageData);
      } else {
        setError(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch package details.");
    } finally {
      setLoading(false);
    }
  };

  const getRatings = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/rating/get-ratings/${params.id}/4`);
      const data = await res.json();
      if (data) {
        setPackageRatings(data);
      } else {
        setPackageRatings([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkRatingGiven = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/rating/rating-given/${currentUser?._id}/${params?.id}`);
      const data = await res.json();
      setRatingGiven(data?.given);
    } catch (error) {
      console.error(error);
    }
  };

  const giveRating = async () => {
    await checkRatingGiven();
    if (ratingGiven) {
      toast.error("You already submitted your rating!");
      return;
    }
    if (ratingsData.rating === 0 && ratingsData.review === "") {
      toast.error("At least 1 field is required!");
      return;
    }
    if (ratingsData.rating === 0 && ratingsData.review === "" && !ratingsData.userRef) {
      toast.error("All fields are required!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/rating/give-rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratingsData),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(data?.message);
        setRatingsData({ ...ratingsData, rating: 0, review: "" });
        getPackageData();
        getRatings();
        checkRatingGiven();
      } else {
        toast.error(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit rating.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      getPackageData();
      getRatings();
    }
    if (currentUser) {
      checkRatingGiven();
    }
  }, [params.id, currentUser]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EB662B]"></div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="w-full text-center py-20">
        <h2 className="text-2xl font-bold text-red-600">{error || "Package not found"}</h2>
        <button onClick={() => navigate("/search")} className="mt-4 px-6 py-2 bg-[#EB662B] text-white rounded-lg">
          Browse Other Packages
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="w-full flex flex-col md:flex-row items-start justify-between gap-10">
        <div className="w-full md:w-1/2 flex flex-col items-start gap-4">
          <h1 className="text-[#05073C] text-2xl md:text-4xl font-extrabold leading-tight">
            {packageData?.packageName}
          </h1>
          
          <div className="w-full flex items-center justify-between mt-2 border-b pb-4">
            <p className="text-gray-600 text-lg font-medium flex items-center gap-2">
              <span className="text-[#EB662B]">📍</span> {packageData?.packageDestination}
            </p>
            <p className="text-[#EB662B] text-2xl font-black">
              ${packageData?.packageOffer && packageData?.packageDiscountPrice > 0 ? packageData?.packageDiscountPrice : packageData?.packagePrice}
            </p>
          </div>

          {(Number(packageData?.packageDays) > 0 || Number(packageData?.packageNights) > 0) && (
            <div className="flex items-center gap-2 text-gray-700 font-medium bg-orange-50 px-4 py-2 rounded-lg">
              <FaClock className="text-[#EB662B]" />
              {Number(packageData?.packageDays) > 0 && `${packageData?.packageDays} Day${packageData?.packageDays > 1 ? 's' : ''}`}
              {(Number(packageData?.packageDays) > 0 && Number(packageData?.packageNights) > 0) && " - "}
              {Number(packageData?.packageNights) > 0 && `${packageData?.packageNights} Night${packageData?.packageNights > 1 ? 's' : ''}`}
            </div>
          )}
          
          {(packageData?.packageTotalRatings || 0) > 0 && (
            <div className="flex items-center gap-2 my-1">
              <Rating value={packageData?.packageRating || 0} readOnly precision={0.1} />
              <span className="text-gray-600 font-medium">({packageData?.packageTotalRatings} reviews)</span>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full mt-4 bg-gray-50 p-6 rounded-xl border">
            <div className="flex flex-col gap-1">
              <h4 className="text-gray-900 font-bold uppercase text-sm tracking-wider">Activities</h4>
              <p className="text-gray-700">{packageData?.packageActivities || "Not specified"}</p>
            </div>
            <div className="flex flex-col gap-1 border-t pt-3">
              <h4 className="text-gray-900 font-bold uppercase text-sm tracking-wider">Meals</h4>
              <p className="text-gray-700">{packageData?.packageMeals || "Not specified"}</p>
            </div>
            <div className="flex flex-col gap-1 border-t pt-3">
              <h4 className="text-gray-900 font-bold uppercase text-sm tracking-wider">Transportation</h4>
              <p className="text-gray-700">{packageData?.packageTransportation || "Not specified"}</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          {packageData?.packageImages?.length > 0 ? (
            <Swiper
              modules={[Autoplay, Navigation]}
              navigation
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={packageData.packageImages.length > 1}
              className="w-full h-[350px] md:h-[450px] rounded-2xl shadow-lg"
            >
              {packageData.packageImages.map((img, i) => (
                <SwiperSlide key={i}>
                  <img
                    src={img?.startsWith("http") ? img : `${imageUrlBase}/images/${img}`}
                    alt={`${packageData?.packageName} - image ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full h-[350px] md:h-[450px] rounded-2xl bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row items-start justify-between gap-10 py-12 mt-8 border-t">
        <div className="w-full md:w-[60%] flex flex-col items-start gap-4">
          <h2 className="text-gray-900 text-2xl font-bold">About This Trip</h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            {packageData?.packageDescription || "No description provided."}
          </p>

          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                navigate(`/booking/${params?.id}`);
              } else {
                toast.info("Please login to book a package");
                navigate("/login");
              }
            }}
            className="mt-6 w-[200px] bg-[#EB662B] text-white font-bold text-lg rounded-xl p-4 shadow-md hover:bg-orange-700 hover:shadow-lg transition transform hover:-translate-y-1"
          >
            Book Now
          </button>
        </div>

        <div className="w-full md:w-[35%] flex flex-col gap-4 bg-gray-50 p-6 rounded-xl border">
          <h2 className="text-gray-900 text-xl font-bold border-b pb-2">Accommodation Details</h2>
          <p className="text-gray-700 leading-relaxed">
            {packageData?.packageAccommodation || "Accommodation details not specified."}
          </p>
          <button 
            onClick={() => setShowMap(true)}
            className="mt-4 text-[#EB662B] font-semibold hover:underline flex items-center gap-2"
          >
            📍 View Destination on Map
          </button>
        </div>
      </div>
      
      <hr className="border-t border-gray-200 my-8" />
      
      <div className="w-full flex flex-col items-center pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Ratings & Reviews</h2>
        
        <div className={`w-full max-w-2xl bg-white p-6 rounded-xl shadow-sm border mb-10 ${(!currentUser || ratingGiven) ? "hidden" : "flex flex-col items-center"}`}>
          <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
          <Rating
            name="simple-controlled"
            size="large"
            value={ratingsData?.rating}
            onChange={(e, newValue) => setRatingsData({ ...ratingsData, rating: newValue })}
          />
          <textarea
            className="w-full mt-4 p-4 border border-gray-300 rounded-lg outline-none focus:border-[#EB662B] resize-none"
            rows={4}
            placeholder="Share your experience about this trip..."
            value={ratingsData?.review}
            onChange={(e) => setRatingsData({ ...ratingsData, review: e.target.value })}
          />
          <button
            disabled={loading || (ratingsData.rating === 0 && ratingsData.review === "")}
            type="button"
            onClick={giveRating}
            className="mt-4 w-full py-3 bg-[#EB662B] text-white font-bold rounded-lg disabled:opacity-50 hover:opacity-90 transition"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {packageRatings && packageRatings.length > 0 ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RatingCard packageRatings={packageRatings} />
            
            {(packageData?.packageTotalRatings || 0) > 4 && (
              <button
                onClick={() => navigate(`/package/ratings/${params?.id}`)}
                className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-[#EB662B] hover:text-[#EB662B] transition font-bold text-lg"
              >
                View All Reviews <FaArrowRight />
              </button>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review this package!</p>
        )}

        {!currentUser && (
          <button
            onClick={() => navigate("/login")}
            className="mt-6 px-8 py-3 rounded-lg text-white font-bold bg-[#6358DC] hover:opacity-90 transition"
          >
            Login to Rate Package
          </button>
        )}
      </div>

      {showMap && (
        <MapModal
          location={packageData?.packageDestination || "Bangladesh"}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
};

export default Package;