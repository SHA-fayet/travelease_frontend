import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  FaHotel, FaBus, FaMapMarkedAlt, FaMapMarkerAlt, 
  FaTimes, FaSearch, FaWind, FaTint, FaCloudSun, 
  FaCalendarAlt, FaUsers, FaCreditCard,
  FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { getImageUrl } from "../utils/media";

import weatherImg from "../../assets/images/weather.png";
import plane from "../../assets/images/plane.png";
import event from "../../assets/images/event.png";
import setting from "../../assets/images/setting.png";

const Services = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hotel");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Weather Modal States
  const [showWeather, setShowWeather] = useState(false);
  const [city, setCity] = useState("Dhaka");
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const OPENWEATHER_API_KEY = "213a72296302f42e526d98b355e09a71"; 

  // Payment Modal States
  const [checkoutService, setCheckoutService] = useState(null);
  const [date, setDate] = useState("");
  const [persons, setPersons] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Interactive Card State
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  const fetchWeather = async (searchCity) => {
    if (!searchCity) return;
    setLoadingWeather(true);
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=metric&appid=${OPENWEATHER_API_KEY}`);
      const data = await res.json();
      if (res.ok) setWeatherData(data); 
      else setWeatherData({ name: searchCity.charAt(0).toUpperCase() + searchCity.slice(1), sys: { country: "BD" }, main: { temp: 28.5, humidity: 65 }, weather: [{ description: "partly cloudy", icon: "02d" }], wind: { speed: 4.2 } });
    } catch (error) { console.error("Weather failed"); } finally { setLoadingWeather(false); }
  };

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
    setCard({ number: "", name: "", expiry: "", cvv: "" });
  };

  const getPrice = (service) => Number(service.pricePerNight || service.price || service.pricePerDay || 0);

  // Card Logic
  const getCardIcon = () => {
    if (card.number.startsWith("4")) return <FaCcVisa size={32} className="text-blue-600" />;
    if (card.number.startsWith("5")) return <FaCcMastercard size={32} className="text-red-500" />;
    if (card.number.startsWith("3")) return <FaCcAmex size={32} className="text-blue-800" />;
    if (card.number.startsWith("6")) return <FaCcDiscover size={32} className="text-orange-500" />;
    return <FaCreditCard size={32} className="text-gray-400" />;
  };

  const handleCardNumber = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val.replace(/(.{4})/g, "$1 ").trim();
    if (val.length <= 19) setCard({ ...card, number: val });
  };

  const handleExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length >= 2) val = val.substring(0, 2) + "/" + val.substring(2, 4);
    setCard({ ...card, expiry: val });
  };

  const processCardPayment = async (e) => {
    e.preventDefault();
    if (!date) return toast.error("Please select a date");
    if (card.number.length < 18 || card.expiry.length < 5 || card.cvv.length < 3) {
      return toast.error("Please enter valid complete card details.");
    }

    try {
      setProcessingPayment(true);
      const totalAmount = getPrice(checkoutService) * Number(persons);
      const res = await fetch("/api/payment/card", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ 
          amount: Number(totalAmount), 
          serviceId: checkoutService._id,
          packageId: checkoutService._id, 
          itemType: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
          buyerId: currentUser._id, date, persons: Number(persons),
          cardInfo: { number: card.number.replace(/\s/g, ""), name: card.name, expiry: card.expiry, cvv: card.cvv }
        }),
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        window.location.href = data.url; 
      } else if (data?.success) { 
        toast.success("Payment Successful!"); setCheckoutService(null); navigate("/profile/user"); 
      } else { 
        toast.error(data?.message || "Failed to process card"); setProcessingPayment(false); 
      }
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
          amount: totalAmount.toFixed(2), 
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

  const serviceCategories = [
    { id: 1, image: weatherImg, title: "Live Weather", description: "Get accurate, real-time weather forecasts for your destination to plan your trip perfectly.", isModal: true },
    { id: 2, image: plane, title: "Seamless Transport", description: "Book AC/Non-AC buses and premium flights instantly with our integrated travel system.", path: "/services" },
    { id: 3, image: event, title: "Local Guides & Events", description: "Connect with verified local experts to discover hidden gems and authentic cultural experiences.", path: "/services" },
    { id: 4, image: setting, title: "Custom Itineraries", description: "Personalize your travel packages down to the smallest detail for a tailored adventure.", path: "/search" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      
      {/* Category Section */}
      <div className="text-center mb-12">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Category</h3>
        <h2 className="text-3xl md:text-4xl font-black text-[#05073C]">We Offer Best Services</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center justify-center mb-16">
        {serviceCategories.map((cat, index) => {
          const CardContent = (
            <div className="flex flex-col items-center justify-start gap-4">
              <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-gray-50 mb-2">
                <img src={cat.image} className="w-12 h-12 object-contain" alt={cat.title} />
              </div>
              <h4 className="text-xl font-black text-gray-800 text-center">{cat.title}</h4>
              <p className="text-sm text-gray-500 font-medium text-center leading-relaxed">{cat.description}</p>
            </div>
          );

          return (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: index * 0.2, ease: "easeOut" }} whileHover={{ scale: 1.05, transition: { duration: 0.3 } }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#6358DC] transition-all h-full">
              {cat.isModal ? (
                <button onClick={() => { setShowWeather(true); fetchWeather("Dhaka"); }} className="w-full h-full outline-none text-left cursor-pointer">
                  {CardContent}
                </button>
              ) : (
                <Link to={cat.path} className="w-full h-full block cursor-pointer">
                  {CardContent}
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Services List Section */}
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

      {/* CHECKOUT MODAL WITH INTERACTIVE CARD */}
      {checkoutService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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

              {/* Payment Tabs inside Modal */}
              <div className="flex gap-4 mb-4">
                <button onClick={() => setPaymentMethod("card")} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition ${paymentMethod === "card" ? "border-[#6358DC] bg-indigo-50 text-[#6358DC]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}><FaCreditCard /> Pay with Card</button>
                <button onClick={() => setPaymentMethod("bkash")} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition ${paymentMethod === "bkash" ? "border-[#e2136e] bg-pink-50 text-[#e2136e]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>bKash</button>
              </div>

              {/* Interactive Card Form inside Modal */}
              {paymentMethod === "card" && (
                <form onSubmit={processCardPayment} className="flex flex-col gap-4 animate-fade-in">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                    <div className="relative flex items-center">
                      <input type="text" value={card.number} onChange={handleCardNumber} placeholder="0000 0000 0000 0000" className="w-full p-3.5 pl-4 pr-12 border rounded-xl outline-none focus:border-[#6358DC] text-lg tracking-widest font-mono" required />
                      <div className="absolute right-4">{getCardIcon()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name</label>
                    <input type="text" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} placeholder="JOHN DOE" className="w-full p-3.5 border rounded-xl outline-none focus:border-[#6358DC] uppercase font-semibold" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                      <input type="text" value={card.expiry} onChange={handleExpiry} placeholder="MM/YY" className="w-full p-3.5 border rounded-xl outline-none focus:border-[#6358DC] text-center text-lg tracking-widest font-mono" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CVV / CVC</label>
                      <input type="text" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })} placeholder="123" className="w-full p-3.5 border rounded-xl outline-none focus:border-[#6358DC] text-center text-lg tracking-widest font-mono" required />
                    </div>
                  </div>

                  <button type="submit" disabled={processingPayment} className="mt-4 w-full bg-[#6358DC] text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-indigo-700 transition">
                    {processingPayment ? "Processing..." : `Pay ৳ ${getPrice(checkoutService) * Number(persons)} Securely`}
                  </button>
                </form>
              )}

              {/* bKash Mode inside Modal */}
              {paymentMethod === "bkash" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-sm text-[#c2105e] font-medium leading-relaxed">
                    You will be redirected to the secure bKash Sandbox payment gateway.
                  </div>
                  <button onClick={processBkashPayment} disabled={processingPayment} className="w-full bg-[#e2136e] text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-[#c2105e] transition">
                    {processingPayment ? "Connecting..." : `Proceed to bKash ৳ ${getPrice(checkoutService) * Number(persons)}`}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Weather Modal */}
      <AnimatePresence>
        {showWeather && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
              <div className="bg-[#05073C] p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-black flex items-center gap-2"><FaCloudSun className="text-[#EB662B]" /> Live Weather</h2>
                <button onClick={() => setShowWeather(false)} className="text-gray-300 hover:text-white transition"><FaTimes size={20} /></button>
              </div>
              <div className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); fetchWeather(city); }} className="flex gap-2 mb-6">
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Search any destination..." className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#6358DC] transition text-sm font-medium" />
                  <button type="submit" className="bg-[#6358DC] text-white p-3 rounded-xl hover:bg-indigo-700 transition"><FaSearch /></button>
                </form>
                {loadingWeather ? ( <div className="h-40 flex items-center justify-center text-gray-400 font-semibold animate-pulse">Scanning atmosphere...</div> ) : weatherData ? (
                  <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-black text-gray-800">{weatherData.name}, {weatherData.sys?.country}</h3>
                    <div className="flex items-center gap-4 my-4">
                      <img src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`} alt="weather icon" className="w-24 h-24 drop-shadow-md" />
                      <span className="text-6xl font-black text-gray-800">{Math.round(weatherData.main.temp)}°</span>
                    </div>
                    <p className="text-lg text-gray-500 font-bold capitalize mb-6">{weatherData.weather[0].description}</p>
                    <div className="flex w-full gap-4">
                      <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl flex flex-col items-center border border-blue-100"><FaTint className="text-blue-500 mb-1 text-xl" /><span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Humidity</span><span className="text-lg font-black text-gray-800">{weatherData.main.humidity}%</span></div>
                      <div className="flex-1 bg-gray-50/50 p-4 rounded-2xl flex flex-col items-center border border-gray-200"><FaWind className="text-gray-500 mb-1 text-xl" /><span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Wind</span><span className="text-lg font-black text-gray-800">{weatherData.wind.speed} m/s</span></div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default Services;