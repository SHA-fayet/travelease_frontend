import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";
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

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await fetch(`/api/package/get-package-data/${packageId}`);
        const data = await res.json();
        if (data?.success) setPackageData(data.packageData);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    if (packageId && packageId !== "undefined") fetchPackage();
  }, [packageId]);

  if (loading || !packageData) return <h1 className="text-center mt-20 text-2xl font-bold text-gray-600">Loading trip details...</h1>;

  const unitPrice = packageData.packageOffer && packageData.packageDiscountPrice > 0 ? packageData.packageDiscountPrice : packageData.packagePrice;
  const totalPrice = Number(unitPrice) * Number(persons);

  const handleBkashPayment = async (e) => {
    e.preventDefault();
    if (!date) return toast.error("Please select a travel date");
    try {
      setProcessingPayment(true);
      const res = await fetch("/api/payment/create-payment", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ amount: Number(totalPrice), packageId, buyerId: currentUser._id, date, persons: Number(persons) }),
      });
      const data = await res.json();
      if (data?.success && data?.bkashURL) { window.location.href = data.bkashURL; } 
      else { toast.error(data?.message || "Failed to initialize bKash gateway"); setProcessingPayment(false); }
    } catch (error) { toast.error("Payment connection failed."); setProcessingPayment(false); }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!date) return toast.error("Please select a travel date");
    try {
      setProcessingPayment(true);
      const res = await fetch("/api/payment/stripe", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ amount: Number(totalPrice), packageId, buyerId: currentUser._id, date, persons: Number(persons) }),
      });
      const data = await res.json();
      if (data?.success && data?.url) { window.location.href = data.url; } 
      else { toast.error(data?.message || "Failed to initialize Stripe gateway"); setProcessingPayment(false); }
    } catch (error) { toast.error("Payment connection failed."); setProcessingPayment(false); }
  };

  let imgRef = Array.isArray(packageData?.packageImages) ? packageData.packageImages[0] : packageData?.packageImages;
  if (imgRef && typeof imgRef === 'object' && imgRef.url) imgRef = imgRef.url;
  const imageUrl = getImageUrl(imgRef) || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-4">Checkout & Payment</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-md border p-6 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Trip Itinerary</h3>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2"><FaCalendarAlt className="inline mr-2 text-[#e2136e]"/> Select Date</label><input type="date" min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border rounded-xl" required /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2"><FaUsers className="inline mr-2 text-[#e2136e]"/> Travelers</label><input type="number" min={1} value={persons} onChange={(e) => setPersons(e.target.value)} className="w-full p-3 border rounded-xl" required /></div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border p-6 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Order Summary</h3>
          <div className="flex gap-4">
            <img src={imageUrl} alt="Package" className="w-24 h-24 object-cover rounded-lg shadow-sm" />
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-gray-900 leading-tight">{packageData.packageName}</h4>
              <p className="text-sm text-gray-500 mt-1"><FaMapMarkerAlt className="inline"/> {packageData.packageDestination}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl mt-2 flex flex-col gap-3">
            <div className="flex justify-between text-gray-600 font-medium"><span>Unit Price</span><span>৳ {unitPrice} BDT</span></div>
            <div className="flex justify-between text-lg font-extrabold text-gray-900 border-t pt-3"><span>Total</span><span className="text-[#e2136e]">৳ {totalPrice} BDT</span></div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button onClick={handleCardPayment} disabled={processingPayment} className="w-full bg-[#6358DC] hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-base shadow-lg transition flex items-center justify-center gap-2">
              <FaCreditCard /> Pay with Card
            </button>
            <button onClick={handleBkashPayment} disabled={processingPayment} className="w-full bg-[#e2136e] hover:bg-[#c2105e] text-white py-3.5 rounded-xl font-bold text-base shadow-lg transition">
              {processingPayment ? "Connecting..." : "Pay with bKash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Booking;