import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaHotel, FaBus, FaMapMarkedAlt, FaTimes, FaCalendarAlt, FaUsers, FaCreditCard } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/media";

const Services = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hotel");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Payment Modal States
  const [checkoutService, setCheckoutService] = useState(null);
  const [date, setDate] = useState("");
  const [persons, setPersons] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/services/${activeTab}/list?location=${searchQuery}`);
      const data = await res.json();
      if (data.success) setServices(data.data); else setServices([]);
    } catch (error) { toast.error("Failed to fetch services"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, [activeTab]);

  const handleSearch = (e) => { e.preventDefault(); fetchServices(); };

  const initiateCheckout = (service) => {
    if (!currentUser) { toast.error("Please log in to book services."); navigate("/login"); return; }
    setCheckoutService(service);
    setDate("");
    setPersons(1);
    setPaymentMethod("card");
  };

  const getPrice = (service) => Number(service.pricePerNight || service.price || service.pricePerDay || 0);

  const processCardPayment = async (e) => {
    e.preventDefault();
    if (!date) return toast.error("Please select a date");
    try {
      setProcessingPayment(true);
      const res = await fetch("/api/payment/stripe", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ 
          amount: getPrice(checkoutService) * Number(persons), 
          serviceId: checkoutService._id,
          packageId: checkoutService._id, // Fallback for backend compatibility
          itemType: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
          buyerId: currentUser._id, date, persons: Number(persons) 
        }),
      });
      const data = await res.json();
      if (data?.success && data?.url) window.location.href = data.url; 
      else { toast.error(data?.message || "Failed to initialize Card gateway"); setProcessingPayment(false); }
    } catch (error) { toast.error("Payment connection failed."); setProcessingPayment(false); }
  };

  const processBkashPayment = async (e) => {
    e.preventDefault();
    if (!date) return toast.error("Please select a date");
    try {
      setProcessingPayment(true);
      const totalAmount = getPrice(checkoutService) * Number(persons);
      const res = await fetch("/api/payment/create-payment", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ 
          amount: totalAmount.toFixed(2), // Strict bKash formatting
          serviceId: checkoutService._id, packageId: checkoutService._id,
          itemType: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
          buyerId: currentUser._id, date, persons: Number(persons) 
        }),
      });
      const data = await res.json();
      if (data?.success && data?.bkashURL) window.location.href = data.bkashURL; 
      else { toast.error(data?.message || "Failed to initialize bKash gateway"); setProcessingPayment(false); }
    } catch (error) { toast.error("Payment connection failed."); setProcessingPayment(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <div className="text-center mb-10"><h1 className="text-4xl font-black text-[#05073C] mb-4">Independent Travel Services</h1></div>
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 flex gap-2">
        <input type="text" placeholder="Search by location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 p-4 rounded-xl border border-gray-300 outline-none focus:border-[#EB662B] shadow-sm" />
        <button type="submit" className="bg-[#EB662B] text-white px-8 font-bold rounded-xl hover:bg-orange-700 transition">Search</button>
      </form>
      
      <div className="flex justify-center gap-4 mb-10 border-b pb-4">
        <button onClick={() => setActiveTab("hotel")} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition ${activeTab === "hotel" ? "bg-[#EB662B] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}><FaHotel /> Hotels</button>
        <button onClick={() => setActiveTab("transportation")} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition ${activeTab === "transportation" ? "bg-[#EB662B] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}><FaBus /> Transport</button>
        <button onClick={() => setActiveTab("guide")} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition ${activeTab === "guide" ? "bg-[#EB662B] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}><FaMapMarkedAlt /> Local Guides</button>
      </div>

      {loading ? ( <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EB662B]"></div></div> ) : services.length === 0 ? ( <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed"><p className="text-gray-500 font-medium">No {activeTab}s found.</p></div> ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const imgRef = Array.isArray(service?.images) ? service.images[0] : service?.images;
            const serviceImgUrl = getImageUrl(imgRef) || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";
            return (
              <div key={service._id} className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition">
                <div className="h-48 bg-gray-200 overflow-hidden"><img src={serviceImgUrl} alt={service.name || service.operatorName} className="w-full h-full object-cover" /></div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-xl text-gray-900 leading-tight">{service.name || `${service.operatorName} - ${service.vehicleType}`}</h3><span className="bg-orange-100 text-[#EB662B] font-black px-3 py-1 rounded-lg text-sm whitespace-nowrap">৳ {getPrice(service)}</span></div>
                  <p className="text-gray-500 text-sm mb-4 font-medium">📍 {service.location || `${service.departureLocation} to ${service.arrivalLocation}`}</p>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">{service.description || service.expertise}</p>
                  <button onClick={() => initiateCheckout(service)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">Book Now</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="bg-[#05073C] p-6 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black">Checkout Service</h2>
              <button onClick={() => setCheckoutService(null)} className="text-gray-300 hover:text-white transition"><FaTimes size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-gray-900 text-lg">{checkoutService.name || `${checkoutService.operatorName} - ${checkoutService.vehicleType}`}</h4>
                  <p className="text-sm text-gray-500"><FaMapMarkerAlt className="inline"/> {checkoutService.location || `${checkoutService.departureLocation} to ${checkoutService.arrivalLocation}`}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2"><FaCalendarAlt className="inline mr-2 text-[#e2136e]"/> Select Date</label><input type="date" min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-[#6358DC]" required /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2"><FaUsers className="inline mr-2 text-[#e2136e]"/> Quantity/Persons</label><input type="number" min={1} value={persons} onChange={(e) => setPersons(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-[#6358DC]" required /></div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between text-lg font-extrabold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-[#e2136e]">৳ {getPrice(checkoutService) * Number(persons)} BDT</span>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <button onClick={() => setPaymentMethod("card")} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition ${paymentMethod === "card" ? "border-[#6358DC] bg-indigo-50 text-[#6358DC]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}><FaCreditCard /> Pay with Card</button>
                <button onClick={() => setPaymentMethod("bkash")} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition ${paymentMethod === "bkash" ? "border-[#e2136e] bg-pink-50 text-[#e2136e]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>bKash</button>
              </div>

              {paymentMethod === "card" ? (
                <button onClick={processCardPayment} disabled={processingPayment} className="w-full bg-[#6358DC] text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-indigo-700 transition">
                  {processingPayment ? "Processing..." : `Pay ৳ ${getPrice(checkoutService) * Number(persons)} Securely`}
                </button>
              ) : (
                <button onClick={processBkashPayment} disabled={processingPayment} className="w-full bg-[#e2136e] text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-[#c2105e] transition">
                  {processingPayment ? "Connecting..." : `Proceed to bKash ৳ ${getPrice(checkoutService) * Number(persons)}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Services;