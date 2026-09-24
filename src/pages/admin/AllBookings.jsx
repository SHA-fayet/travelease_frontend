import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Chart from "../components/Chart";
import { toast } from "react-toastify";
import { FaSearch, FaFileCsv, FaFilePdf } from "react-icons/fa";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const getImgUrl = (pkg) => {
  // Universally support both legacy packages and new services
  const images = pkg?.packageImages || pkg?.images;
  if (!images || !Array.isArray(images) || images.length === 0) return "https://via.placeholder.com/150?text=No+Image";
  return images[0].startsWith("http") ? images[0] : `http://localhost:8000/images/${images[0]}`;
};

const AllBookings = ({ refreshData }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, usersRes] = await Promise.all([
        fetch(`/api/booking/get-currentBookings?searchTerm=${searchTerm}`, { credentials: "include" }),
        fetch(`/api/user/getAllUsers`, { credentials: "include" })
      ]);
      const bookingsData = await bookingsRes.json();
      const usersData = await usersRes.json();
      
      if (bookingsData?.success) setCurrentBookings(bookingsData?.bookings);
      if (Array.isArray(usersData)) setAllUsers(usersData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [searchTerm]);

  const getCustomerDetails = (booking) => {
    const buyerId = typeof booking?.buyer === "string" ? booking.buyer : (booking?.buyer?._id || booking?.userId);
    const matchedUser = allUsers.find((u) => u._id === buyerId);
    if (matchedUser) return { name: matchedUser.username, phone: matchedUser.phone || "No Phone", email: matchedUser.email || "No Email" };
    if (booking?.buyer?.username) return { name: booking.buyer.username, phone: booking.buyer.phone || "No Phone", email: booking.buyer.email || "No Email" };
    return { name: "Guest / Deleted", phone: "N/A", email: "N/A" };
  };

  const handleCancel = async (id) => {
    if(!window.confirm("As an Admin, cancel this booking? Income will be instantly removed.")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/booking/cancel-booking/${id}/${currentUser._id}`, { 
        method: "POST", 
        headers: { "Content-Type":"application/json" }, 
        body: JSON.stringify({ reason: "Admin Cancelled Directly" }) 
      });
      const data = await res.json();
      if (data?.success) { 
        toast.success(data?.message); 
        fetchData(); 
        if (refreshData) refreshData(); 
      } else { 
        toast.error(data?.message); 
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const downloadCSV = () => {
    const headers = ["Item Name", "Customer Name", "Phone", "Email", "Travel Date", "Travelers", "Amount (BDT)", "Status"];
    const rows = currentBookings.map(b => {
      const pkg = b?.packageDetails || b?.packageId || b?.serviceId || {};
      const isService = b?.itemType && b.itemType !== "Package";
      const itemName = isService ? (b.serviceName || "Standalone Service") : (pkg?.packageName || "Deleted Package");
      const customer = getCustomerDetails(b);
      const travelDate = new Date(b?.date || b?.travelDate || b?.createdAt).toLocaleDateString('en-CA');
      const status = b?.status || b?.bookingStatus || "Confirmed";

      return [
        `"${itemName}"`,
        `"${customer.name}"`,
        `"${customer.phone}"`,
        `"${customer.email}"`,
        `"${travelDate}"`,
        b?.persons || b?.travelersCount || 1,
        b?.status === "Cancelled" ? 0 : (b?.totalPrice || 0),
        `"${status}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Trip_Manifest.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("TravelEase - Operational Trip Manifest", 14, 15);
    
    const tableColumns = ["Item Booked", "Customer", "Phone", "Travel Date", "Pax", "Total (BDT)", "Status"];
    const tableRows = currentBookings.map(b => {
      const pkg = b?.packageDetails || b?.packageId || b?.serviceId || {};
      const isService = b?.itemType && b.itemType !== "Package";
      const itemName = isService ? (b.serviceName || "Standalone Service") : (pkg?.packageName || "Deleted Package");
      const customer = getCustomerDetails(b);
      const travelDate = new Date(b?.date || b?.travelDate || b?.createdAt).toLocaleDateString();
      const status = b?.status || b?.bookingStatus || "Confirmed";

      return [
        itemName,
        customer.name,
        customer.phone,
        travelDate,
        b?.persons || b?.travelersCount || 1,
        b?.status === "Cancelled" ? "Refunded" : `Tk ${b?.totalPrice || 0}`,
        status
      ];
    });

    autoTable(doc, { head: [tableColumns], body: tableRows, startY: 20, styles: { fontSize: 9 }, headStyles: { fillColor: [235, 102, 43] } });
    doc.save("Trip_Manifest.pdf");
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1 w-full flex items-center bg-gray-50 border-2 border-gray-200 rounded-lg px-3 focus-within:border-[#EB662B] transition">
          <FaSearch className="text-gray-400" />
          <input className="w-full p-3 bg-transparent outline-none" type="text" placeholder="Search Bookings, Names, or Phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={downloadCSV} className="flex-1 md:flex-none bg-green-600 text-white px-5 py-3 rounded-lg font-bold shadow hover:bg-green-700 transition flex items-center justify-center gap-2"><FaFileCsv size={18} /> CSV</button>
          <button onClick={downloadPDF} className="flex-1 md:flex-none bg-red-600 text-white px-5 py-3 rounded-lg font-bold shadow hover:bg-red-700 transition flex items-center justify-center gap-2"><FaFilePdf size={18} /> PDF</button>
        </div>
      </div>
      
      {currentBookings.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border overflow-x-auto flex flex-col gap-2">
          <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm mb-2 border-b pb-2">Booking Activity Overview</h3>
          <Chart data={currentBookings} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                <th className="p-4">Item Booked</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Travel Date</th>
                <th className="p-4">Travelers</th>
                <th className="p-4">Total</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center font-bold text-gray-500">Loading Bookings...</td></tr>
              ) : currentBookings.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center font-bold text-gray-500">No upcoming bookings found.</td></tr>
              ) : (
                currentBookings.map((booking) => {
                  const pkg = booking?.packageDetails || booking?.packageId || booking?.serviceId || {};
                  const customer = getCustomerDetails(booking);
                  const isCancelled = booking.status === "Cancelled"; 
                  const isService = booking?.itemType && booking.itemType !== "Package";
                  const itemName = isService ? (booking.serviceName || "Standalone Service") : (pkg?.packageName || "Deleted Package");
                  const itemLink = isService ? "/services" : (pkg?._id ? `/package/${pkg._id}` : null);
                  
                  return (
                    <tr key={booking._id} className={`transition ${isCancelled ? "bg-red-50/50" : "hover:bg-gray-50"}`}>
                      <td className="p-4 flex items-center gap-3">
                        <img className="w-10 h-10 rounded object-cover border" src={getImgUrl(pkg)} alt="img" />
                        {itemLink ? (
                          <Link to={itemLink} className="font-bold text-gray-800 hover:text-[#EB662B] line-clamp-2">
                            {itemName}
                          </Link>
                        ) : (
                          <span className="font-bold text-gray-800 line-clamp-2">{itemName}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{customer.name}</p>
                        <p className="text-gray-500 text-xs font-semibold">{customer.phone}</p>
                      </td>
                      <td className="p-4 font-bold text-[#6358DC]">
                        {new Date(booking?.date || booking?.travelDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-semibold text-gray-700">
                        {booking?.persons || booking?.travelersCount || 1} People
                      </td>
                      <td className="p-4">
                        {isCancelled ? (
                           <span className="font-bold text-gray-400 line-through">৳ {booking?.totalPrice}</span>
                        ) : (
                           <span className="font-black text-[#EB662B]">৳ {booking?.totalPrice || 0}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isCancelled ? (
                           <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Cancelled</span>
                        ) : (
                          <button onClick={() => handleCancel(booking._id)} className="px-4 py-2 bg-red-50 text-red-600 rounded font-bold hover:bg-red-600 hover:text-white transition">
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AllBookings;