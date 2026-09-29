import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBell, FaTimes, FaInfoCircle, FaCheckDouble, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getImageUrl } from "../../utils/media";

const MyBookings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customerNotifs, setCustomerNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchMyBookings = async () => {
    if (!currentUser?._id) return; 
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("searchTerm", searchTerm);
      params.append("nocache", new Date().getTime());

      const res = await fetch(`/api/booking/get-allUserBookings/${currentUser._id}?${params.toString()}`, {
        method: "GET", credentials: "include",
      });
      
      if (!res.ok) throw new Error("Server returned an error status");
      const data = await res.json();
      
      if (data?.success && Array.isArray(data?.bookings)) {
        const activeTrips = data.bookings.filter(b => {
          const isPast = new Date(b.date || b.travelDate).getTime() < new Date().getTime();
          const isRefunded = b.status === "Cancelled" || b.bookingStatus === "Cancelled";
          return !isPast && !isRefunded;
        });
        setMyBookings(activeTrips);

        const seenNotifs = JSON.parse(localStorage.getItem(`seenNotifs_${currentUser._id}`)) || [];
        const unseenCancellations = data.bookings.filter(
          (b) => (b.status === "Cancelled" || b.bookingStatus === "Cancelled") && !seenNotifs.includes(b._id)
        );
        setCustomerNotifs(unseenCancellations);
      } else {
        setMyBookings([]);
        setCustomerNotifs([]);
      }
    } catch (error) { console.error("Booking Fetch Error:", error); }
  };

  useEffect(() => {
    setLoading(true);
    fetchMyBookings().finally(() => setLoading(false));
    const intervalId = setInterval(() => { fetchMyBookings(); }, 10000);
    return () => clearInterval(intervalId);
  }, [searchTerm, currentUser]);

  const clearNotifications = () => {
    const currentSeen = JSON.parse(localStorage.getItem(`seenNotifs_${currentUser._id}`)) || [];
    const newSeenIds = customerNotifs.map(n => n._id);
    localStorage.setItem(`seenNotifs_${currentUser._id}`, JSON.stringify([...currentSeen, ...newSeenIds]));
    setCustomerNotifs([]);
    setShowNotifs(false);
  };

  const openCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const submitCancellation = async () => {
    if (!cancelReason.trim()) return toast.error("Please provide a reason for cancellation.");
    try {
      setLoading(true);
      const res = await fetch(`/api/booking/cancel-booking/${selectedBookingId}/${currentUser._id}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (data?.success) { toast.success(data?.message); setShowCancelModal(false); fetchMyBookings(); } 
      else { toast.error(data?.message); }
    } catch (error) { toast.error("An error occurred."); } finally { setLoading(false); }
  };

  const generatePDF = async (booking) => {
    const doc = new jsPDF();
    const pkg = booking?.packageDetails || booking?.packageId || booking?.serviceId || {};
    const travelDate = new Date(booking?.date || booking?.travelDate).toLocaleDateString();
    const isService = booking?.itemType && booking.itemType !== "Package";
    const itemName = isService ? (booking.serviceName || "Standalone Service") : (pkg?.packageName || "Package");
    const itemLocation = pkg?.packageDestination || pkg?.location || pkg?.arrivalLocation || "N/A";

    doc.setFontSize(26);
    doc.setTextColor(235, 102, 43); 
    doc.text("TravelEase", 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Official Verified E-Ticket & Invoice", 14, 30);
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Booking ID: ${booking._id.toUpperCase()}`, 14, 45);
    doc.text(`Issued To: ${currentUser?.username}`, 14, 52);
    doc.text(`Email: ${currentUser?.email}`, 14, 59);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 66);

    const tableColumn = ["Description", "Details"];
    const tableRows = [
      ["Item Booked", itemName], ["Destination", itemLocation], ["Travel Date", travelDate],
      ["Quantity/Travelers", (booking?.persons || booking?.travelersCount || 1).toString()],
      ["Payment Status", "Paid in Full"], ["Total Amount Paid", `BDT ${booking?.totalPrice || 0}`]
    ];
    autoTable(doc, { startY: 75, head: [tableColumn], body: tableRows, theme: 'grid', headStyles: { fillColor: [99, 88, 220], textColor: 255 }, alternateRowStyles: { fillColor: [245, 245, 245] }, margin: { top: 10 } });
    
    const finalY = doc.lastAutoTable.finalY || 150;

    try {
      const qrData = `TravelEase-Verified-Booking:${booking._id}-${currentUser.username}`;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise((resolve) => { reader.onloadend = resolve; });
      doc.addImage(reader.result, 'PNG', 155, finalY + 5, 35, 35);
      doc.setFontSize(9);
      doc.text("Scan to Verify", 162, finalY + 43);
    } catch (err) { console.error("QR Code failed", err); }

    doc.setFontSize(10);
    doc.text("Thank you for choosing TravelEase for your journey!", 14, finalY + 15);
    const safeFileName = itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "ticket";
    doc.save(`TravelEase_${safeFileName}_ticket.pdf`);
  };

  if (!currentUser) return <div className="text-center py-20 text-red-600 font-bold">Please log in.</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4 relative z-[100]">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-wider">My Active Trips</h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-72 bg-gray-50 border-2 border-gray-200 rounded-lg px-3 focus-within:border-[#EB662B] transition flex items-center">
            <input className="w-full p-3 bg-transparent outline-none text-sm" type="text" placeholder="Search trips..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 relative">
              <FaBell size={20} />
              {customerNotifs.length > 0 && <span className="absolute -top-1 -right-1 bg-[#EB662B] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">{customerNotifs.length}</span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-4 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[999]">
                <div className="bg-gray-50 border-b p-4 flex justify-between"><h3 className="font-bold">Notifications</h3><button onClick={() => setShowNotifs(false)}><FaTimes /></button></div>
                <div className="max-h-[300px] overflow-y-auto">
                  {customerNotifs.length === 0 ? <div className="p-6 text-center text-gray-500">No new updates.</div> : customerNotifs.map(notif => (
                    <div key={notif._id} className="p-4 border-b"><p className="text-sm">Your cancellation request is <span className="text-green-600 font-bold">Approved</span>.</p></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4">Item Booked</th><th className="p-4">Travel Date</th><th className="p-4">Travelers</th><th className="p-4">Total Paid</th><th className="p-4">Status</th><th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {myBookings.map((booking) => {
                const pkg = booking?.packageDetails || booking?.packageId || booking?.serviceId || {};
                const isPendingCancel = booking?.status === "Cancellation Requested";
                const isService = booking?.itemType && booking.itemType !== "Package";
                const itemName = isService ? (booking.serviceName || "Standalone Service") : (pkg?.packageName || "Package Unavailable");
                
                return (
                  <tr key={booking._id} className="transition hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3">
                      <img className="w-12 h-12 rounded-lg object-cover border" src={getImageUrl(pkg)} alt="img" />
                      <span className="font-bold text-gray-800 line-clamp-2">{itemName}</span>
                    </td>
                    <td className="p-4 font-bold text-[#6358DC]">{new Date(booking?.date || booking?.travelDate).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold text-gray-700">{booking?.persons || booking?.travelersCount || 1}</td>
                    <td className="p-4 font-black text-gray-800">৳ {booking?.totalPrice || 0}</td>
                    <td className="p-4"><span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-green-100 text-green-700 border border-green-200">{booking?.status || "Confirmed"}</span></td>
                    <td className="p-4 flex gap-2 justify-center">
                      {!isPendingCancel && <button onClick={() => generatePDF(booking)} className="px-3 py-2 bg-indigo-50 text-[#6358DC] rounded-lg font-bold hover:bg-[#6358DC] hover:text-white flex items-center gap-1 text-xs"><FaFilePdf /> Ticket</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default MyBookings;