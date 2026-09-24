import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/150?text=Service";
  return imagePath.startsWith("http") ? imagePath : `http://localhost:8000/images/${imagePath}`;
};

const MyHistory = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const getAllBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/get-allUserBookings/${currentUser?._id}?searchTerm=${search}`
      );
      const data = await res.json();
      if (data?.success) {
        setAllBookings(data?.bookings);
        setError(false);
      } else {
        setError(data?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, [search]);

  const handleHistoryDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/booking/delete-booking-history/${id}/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(data?.message);
        getAllBookings();
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full bg-white shadow-sm border rounded-xl p-4">
        <input
          className="w-full border-2 border-gray-100 rounded-lg p-3 outline-none focus:border-[#6358DC] transition"
          type="text"
          placeholder="Search your past trips..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <h1 className="text-center text-xl font-semibold text-gray-600 mt-4">Loading history...</h1>}
      {error && <h1 className="text-center text-xl font-semibold text-red-500 mt-4">{error}</h1>}
      {!loading && allBookings.length === 0 && !error && (
        <h1 className="text-center text-gray-500 mt-4">No past bookings found.</h1>
      )}

      <div className="flex flex-col gap-4">
        {!loading &&
          allBookings.map((booking, i) => {
            const packageData = booking?.packageDetails || booking?.packageId || booking?.serviceId || {};
            const isService = booking?.itemType && booking.itemType !== "Package";
            const itemName = isService ? (booking.serviceName || "Standalone Service") : (packageData?.packageName || "Unknown Item");
            const itemLink = isService ? "/services" : (packageData?._id ? `/package/${packageData._id}` : null);
            
            const imageUrl = getImageUrl(packageData?.packageImages?.[0] || packageData?.images?.[0]);
            
            const isPastOrCancelled = 
              new Date(booking?.date || booking?.travelDate).getTime() < new Date().getTime() ||
              booking?.status === "Cancelled" || 
              booking?.bookingStatus === "Cancelled";

            return (
              <div
                className={`w-full border shadow-sm p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition ${booking?.status === "Cancelled" || booking?.bookingStatus === "Cancelled" ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-200"}`}
                key={booking._id || i}
              >
                <div className="flex items-center gap-4 flex-1 opacity-80 hover:opacity-100 transition">
                  {itemLink ? (
                    <Link to={itemLink} className="shrink-0">
                      <img className="w-16 h-16 rounded-lg object-cover shadow-sm border" src={imageUrl} alt="img" />
                    </Link>
                  ) : (
                    <div className="shrink-0">
                      <img className="w-16 h-16 rounded-lg object-cover shadow-sm border" src={imageUrl} alt="img" />
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    {itemLink ? (
                      <Link to={itemLink}>
                        <h3 className="font-bold text-base text-gray-800 hover:text-[#6358DC] transition leading-tight">
                          {itemName}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="font-bold text-base text-gray-800 transition leading-tight">
                        {itemName}
                      </h3>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Travel Date: <span className="font-semibold text-gray-700">{new Date(booking?.date || booking?.travelDate).toLocaleDateString()}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Status: <span className={`font-bold ${booking?.status === "Cancelled" || booking?.bookingStatus === "Cancelled" ? "text-red-500" : "text-green-600"}`}>
                        {booking?.status || booking?.bookingStatus}
                      </span>
                    </p>
                  </div>
                </div>

                {isPastOrCancelled && (
                  <div className="w-full md:w-auto flex justify-end">
                    <button
                      onClick={() => handleHistoryDelete(booking._id)}
                      className="w-full md:w-auto px-4 py-1.5 rounded-lg bg-gray-200 text-gray-600 font-semibold border hover:bg-red-600 hover:text-white transition text-sm"
                    >
                      Delete Log
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MyHistory;