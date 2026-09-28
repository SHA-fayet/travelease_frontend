import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaCreditCard, 
  FaCcVisa, 
  FaCcMastercard 
} from "react-icons/fa";

const Booking = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [persons, setPersons] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardType, setCardType] = useState("default");

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await fetch(`/api/package/get-package-data/${packageId}`);
        const data = await res.json();
        if (data?.success) setPackageData(data.packageData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [packageId]);

  if (loading || !packageData) return <h1 className="text-center mt-20 text-2xl font-bold">Loading...</h1>;

  const unitPrice = packageData.packageOffer && packageData.packageDiscountPrice > 0
      ? packageData.packageDiscountPrice : packageData.packagePrice;
  const totalPrice = unitPrice * persons;

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    
    if (value.startsWith("4")) setCardType("visa");
    else if (value.startsWith("5")) setCardType("mastercard");
    else setCardType("default");

    let formattedValue = "";
    for (let i = 0; i < value.length; i += 4) {
      formattedValue += value.substring(i, i + 4) + " ";
    }
    
    setCardNumber(formattedValue.trim().substring(0, 19));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    setExpiry(value.substring(0, 5));
  };

  const handleCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    setCvc(value.substring(0, 3));
  };

  const handleBkashPayment = async (e) => {
    e.preventDefault();
    if (!date) return toast.error("Please select a travel date");

    try {
      setProcessingPayment(true);
      const res = await fetch("/api/payment/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: totalPrice, packageId, buyerId: currentUser._id, date, persons }),
      });

      const data = await res.json();
      
      if (data?.success && data?.bkashURL) {
        window.location.href = data.bkashURL; 
      } else {
        toast.error(data?.message || "Failed to initialize bKash gateway");
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment connection failed.");
      setProcessingPayment(false);
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!date) return toast.error("Please select a travel date");
    
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    if (rawCardNumber.length < 16 || expiry.length < 5 || cvc.length < 3) {
      return toast.error("Please provide valid card details");
    }

    try {
      setProcessingPayment(true);
      const res = await fetch("/api/payment/dummy-card-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice, packageId, buyerId: currentUser._id, date, persons, cardNumber: rawCardNumber }),
      });

      const data = await res.json();
      
      if (data?.success) {
        toast.success("Payment successful! Your trip is booked.");
        navigate("/profile/user"); 
      } else {
        toast.error(data?.message || "Card transaction failed");
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment connection failed.");
      setProcessingPayment(false);
    }
  };

  // Safely extract the image preventing undefined crashes
  const images = packageData?.packageImages || packageData?.images;
  const imageUrl = images && images.length > 0 
    ? (images[0].startsWith("http") ? images[0] : `http://localhost:8000/images/${images[0]}`) 
    : "https://via.placeholder.com/150?text=No+Image";

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-4">Checkout & Payment</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Itinerary Selection */}
        <div className="bg-white rounded-2xl shadow-md border p-6 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Trip Itinerary</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2"><FaCalendarAlt className="inline mr-2 text-[#6358DC]"/> Select Date</label>
            <input type="date" min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-[#6358DC]" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2"><FaUsers className="inline mr-2 text-[#6358DC]"/> Travelers</label>
            <input type="number" min={1} value={persons} onChange={(e) => setPersons(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-[#6358DC]" required />
          </div>
        </div>

        {/* Order Summary & Payment */}
        <div className="bg-white rounded-2xl shadow-md border p-6 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Order Summary</h3>
          <div className="flex gap-4">
            <img src={imageUrl} alt="Package" className="w-24 h-24 object-cover rounded-lg shadow-sm" />
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-gray-900 leading-tight">{packageData.packageName || packageData.name}</h4>
              <p className="text-sm text-gray-500 mt-1"><FaMapMarkerAlt className="inline"/> {packageData.packageDestination || packageData.location}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl mt-2 flex flex-col gap-3">
            <div className="flex justify-between text-gray-600 font-medium"><span>Unit Price</span><span>৳ {unitPrice} BDT</span></div>
            <div className="flex justify-between text-lg font-extrabold text-gray-900 border-t pt-3"><span>Total</span><span className="text-[#6358DC]">৳ {totalPrice} BDT</span></div>
          </div>

          <div className="mt-2">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Select Payment Method</h4>
            <div className="flex gap-3">
              <button 
                onClick={() => setPaymentMethod("bkash")}
                className={`flex-1 py-2.5 rounded-lg font-bold border-2 transition ${paymentMethod === "bkash" ? "border-[#e2136e] bg-[#e2136e]/10 text-[#e2136e]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                bKash
              </button>
              <button 
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 py-2.5 rounded-lg font-bold border-2 transition flex items-center justify-center gap-2 ${paymentMethod === "card" ? "border-[#6358DC] bg-[#6358DC]/10 text-[#6358DC]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                <FaCreditCard /> Card
              </button>
            </div>
          </div>

          {paymentMethod === "bkash" ? (
            <button onClick={handleBkashPayment} disabled={processingPayment} className="mt-4 w-full bg-[#e2136e] hover:bg-[#c2105e] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg transition">
              {processingPayment ? "Connecting..." : "Pay with bKash"}
            </button>
          ) : (
            <form onSubmit={handleCardPayment} className="mt-4 flex flex-col gap-4 animate-fade-in-up">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Card Number (e.g. 4242 4242 4242 4242)" 
                  value={cardNumber} 
                  onChange={handleCardNumberChange} 
                  className="w-full p-3.5 pr-12 border border-gray-300 rounded-xl outline-none focus:border-[#6358DC] focus:ring-1 focus:ring-[#6358DC] transition text-gray-800 tracking-wide font-medium" 
                  required 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl transition-colors">
                  {cardType === "visa" && <FaCcVisa className="text-blue-700" />}
                  {cardType === "mastercard" && <FaCcMastercard className="text-orange-600" />}
                  {cardType === "default" && <FaCreditCard />}
                </div>
              </div>

              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  value={expiry} 
                  onChange={handleExpiryChange} 
                  className="w-1/2 p-3.5 border border-gray-300 rounded-xl outline-none focus:border-[#6358DC] focus:ring-1 focus:ring-[#6358DC] transition text-center text-gray-800 font-medium tracking-wider" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="CVC" 
                  value={cvc} 
                  onChange={handleCvcChange} 
                  className="w-1/2 p-3.5 border border-gray-300 rounded-xl outline-none focus:border-[#6358DC] focus:ring-1 focus:ring-[#6358DC] transition text-center text-gray-800 font-medium tracking-widest" 
                  required 
                />
              </div>

              <button type="submit" disabled={processingPayment} className="mt-2 w-full bg-[#6358DC] hover:bg-[#5046b5] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg transition">
                {processingPayment ? "Processing..." : `Pay ৳${totalPrice}`}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
export default Booking;