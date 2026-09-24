import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaHotel, FaBus, FaMapMarkedAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hotel");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/services/${activeTab}/list?location=${searchQuery}`);
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const handleBook = async (service, type) => {
    if (!currentUser) {
      toast.error("Please log in to book services.");
      navigate("/login");
      return;
    }

    try {
      // Default to tomorrow's date for quick checkout demonstration
      const travelDate = new Date(Date.now() + 86400000).toISOString();
      const price = service.pricePerNight || service.price || service.pricePerDay;
      const serviceName = service.name || `${service.operatorName} - ${service.vehicleType}`;

      const res = await fetch("/api/booking/book-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          serviceId: service._id,
          itemType: type.charAt(0).toUpperCase() + type.slice(1), 
          serviceName: serviceName,
          totalPrice: price,
          travelDate: travelDate,
          persons: 1
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Booking failed due to network error.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-[#05073C] mb-4">Independent Travel Services</h1>
        <p className="text-gray-600">Book standalone hotels, transportation, and local guides for your trip.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 flex gap-2">
        <input
          type="text"
          placeholder="Search by location (e.g., Cox's Bazar, Sylhet)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-4 rounded-xl border border-gray-300 outline-none focus:border-[#EB662B] shadow-sm"
        />
        <button type="submit" className="bg-[#EB662B] text-white px-8 font-bold rounded-xl hover:bg-orange-700 transition shadow-md">
          Search
        </button>
      </form>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-10 border-b pb-4">
        <button
          onClick={() => setActiveTab("hotel")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition ${activeTab === "hotel" ? "bg-[#EB662B] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <FaHotel /> Hotels
        </button>
        <button
          onClick={() => setActiveTab("transportation")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition ${activeTab === "transportation" ? "bg-[#EB662B] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <FaBus /> Transport
        </button>
        <button
          onClick={() => setActiveTab("guide")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition ${activeTab === "guide" ? "bg-[#EB662B] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <FaMapMarkedAlt /> Local Guides
        </button>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EB662B]"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
          <p className="text-gray-500 font-medium text-lg">No {activeTab}s found in this location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service._id} className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={service.images?.[0] ? (service.images[0].startsWith('http') ? service.images[0] : `http://localhost:8000/images/${service.images[0]}`) : "https://via.placeholder.com/400x300?text=No+Image"} 
                  alt={service.name || service.operatorName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-gray-900 leading-tight">
                    {service.name || `${service.operatorName} - ${service.vehicleType}`}
                  </h3>
                  <span className="bg-orange-100 text-[#EB662B] font-black px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                    ৳ {service.pricePerNight || service.price || service.pricePerDay}
                  </span>
                </div>
                
                <p className="text-gray-500 text-sm mb-4 font-medium">
                  📍 {service.location || `${service.departureLocation} to ${service.arrivalLocation}`}
                </p>

                <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
                  {service.description || service.expertise || (service.features && service.features.join(", "))}
                </p>

                <button 
                  onClick={() => handleBook(service, activeTab)}
                  className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;