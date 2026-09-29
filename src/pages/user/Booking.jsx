import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { 
  FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaCreditCard, 
  FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover 
} from "react-icons/fa";
import { getImageUrl } from "../../utils/media";

const Booking = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [persons, setPersons] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Payment Mode Toggle
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Interactive Card State
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  useEffect(() => {
    // 100% PREVENTS THE /undefined 400 ERROR
    if (!packageId || packageId === "undefined") {
      setLoading(false);
      return;
    }
    const fetchPackage = async () => {
      try {
        const res = await fetch(`/api/package/get-package-data/${packageId}`);
        const data = await res.json();
        if (data?.success) setPackageData(data.packageData);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchPackage();
  }, [packageId]);

  if (loading || !packageData) return <h1 className="text-center mt-20 text-2xl font-bold text-gray-600">Loading trip details...</h1>;

  const unitPrice = packageData.packageOffer && packageData.packageDiscountPrice > 0 ? packageData.packageDiscountPrice : packageData.packagePrice;
  const totalPrice = Number(unitPrice) * Number(persons);

  // Card Detection Logic
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

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!date) return toast.error("Please select a travel date");
    if (card.number.length < 18 || card.expiry.length < 5 || card.cvv.length < 3) {
      return toast.error("Please enter valid complete card details.");
    }
    
    try {
      setProcessingPayment(true);
      const res = await fetch("/api/payment/card", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ 
          amount: Number(totalPrice), 
          packageId, 
          buyerId: currentUser._id, 
          date, 
          persons: Number(persons),
          cardInfo: {
            number: card.number.replace(/\s/g, ""),
            name: card.name,
            expiry: card.expiry,
            cvv: card.cvv
          }
        }),
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        window.location.href = data.url;
      } else if (data?.success) {
        toast.success("Payment Successful!");
        navigate("/profile/user");
      } else { 
        toast.error(data?.message || "Card declined."); 
        setProcessingPayment(false); 
      }
    } catch (error) { toast.error("Payment connection failed."); setProcessingPayment(false); }
  };

  const handleBkashPayment = async (e) => {
    e.preventDefault();
    if (!date) return toast.error("Please select a travel date");
    try {
      setProcessingPayment(true);
      const res = await fetch("/api/payment/create-payment", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        // STRICT bKash DECIMAL FORMATTING REQUIRED
        body: JSON.stringify({ amount: totalPrice.toFixed(2), packageId, buyerId: currentUser._id, date, persons: Number(persons) }),
      });
      const data = await res.json();
      if (data?.success && data?.bkashURL) { window.location.href = data.bkashURL; } 
      else { toast.error(data?.message || "Failed to initialize bKash gateway"); setProcessingPayment(false); }
    } catch (error) { toast.error("Payment connection failed."); setProcessingPayment(false); }
  };

  // Safe Cloudinary object extractor
  let imgRef = Array.isArray(packageData?.packageImages) ? packageData.packageImages[0] : packageData?.packageImages;
  if (imgRef && typeof imgRef === 'object' && imgRef.url) imgRef = imgRef.url;
  const imageUrl = getImageUrl(imgRef) || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-4">Checkout & Payment</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Itinerary & Payment */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">1. Trip Itinerary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2"><FaCalendarAlt className="inline mr-2 text-[#e2136e]"/> Select Date</label><input type="date" min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-[#6358DC]" required /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2"><FaUsers className="inline mr-2 text-[#e2136e]"/> Travelers</label><input type="number" min={1} value={persons} onChange={(e) => setPersons(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-[#6358DC]" required /></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">2. Payment Method</h3>
            
            {/* Payment Tabs */}
            <div className="flex gap-4 mb-4">
              <button onClick={() => setPaymentMethod("card")} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition ${paymentMethod === "card" ? "border-[#6358DC] bg-indigo-50 text-[#6358DC]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}><FaCreditCard /> Credit / Debit Card</button>
              <button onClick={() => setPaymentMethod("bkash")} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition ${paymentMethod === "bkash" ? "border-[#e2136e] bg-pink-50 text-[#e2136e]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>bKash</button>
            </div>

            {/* Interactive Card Form */}
            {paymentMethod === "card" && (
              <form onSubmit={handleCardPayment} className="flex flex-col gap-4 animate-fade-in">
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

                <button type="submit" disabled={processingPayment} className="mt-4 w-full bg-[#6358DC] hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-lg shadow-lg transition flex items-center justify-center gap-2">
                  {processingPayment ? "Processing..." : `Pay ৳ ${totalPrice} Securely`}
                </button>
              </form>
            )}

            {/* bKash Payment Info */}
            {paymentMethod === "bkash" && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-sm text-[#c2105e] font-medium leading-relaxed">
                  You will be redirected to the secure bKash Sandbox payment gateway. Please ensure your browser's ad-blocker or shields are disabled.
                </div>
                <button onClick={handleBkashPayment} disabled={processingPayment} className="w-full bg-[#e2136e] hover:bg-[#c2105e] text-white py-4 rounded-xl font-black text-lg shadow-lg transition flex items-center justify-center">
                  {processingPayment ? "Connecting to bKash..." : `Proceed to bKash ৳ ${totalPrice}`}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-5 h-fit bg-white rounded-2xl shadow-sm border p-6 flex flex-col gap-4 sticky top-24">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Order Summary</h3>
          <div className="flex gap-4">
            <img src={imageUrl} alt="Package" className="w-24 h-24 object-cover rounded-lg shadow-sm" />
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-gray-900 leading-tight">{packageData.packageName}</h4>
              <p className="text-sm text-gray-500 mt-1"><FaMapMarkerAlt className="inline"/> {packageData.packageDestination}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl mt-4 flex flex-col gap-4">
            <div className="flex justify-between text-gray-600 font-medium"><span>Unit Price</span><span>৳ {unitPrice}</span></div>
            <div className="flex justify-between text-gray-600 font-medium"><span>Travelers</span><span>x {persons}</span></div>
            <div className="flex justify-between text-xl font-black text-gray-900 border-t border-gray-200 pt-4">
              <span>Total</span>
              <span className={paymentMethod === "card" ? "text-[#6358DC]" : "text-[#e2136e]"}>৳ {totalPrice} BDT</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Booking;