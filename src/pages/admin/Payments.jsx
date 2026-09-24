import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaDownload, FaSearch, FaFilter } from "react-icons/fa";

const getImgUrl = (pkg) => {
  const images = pkg?.packageImages;
  if (!images || !Array.isArray(images) || images.length === 0) return "https://via.placeholder.com/150";
  return images[0].startsWith("http") ? images[0] : `http://localhost:8000/images/${images[0]}`;
};

const Payments = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("lifetime"); 
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cacheBuster = `?nocache=${new Date().getTime()}`;
        const [bookingsRes, usersRes] = await Promise.all([
          fetch(`/api/booking/get-allBookings${cacheBuster}`),
          fetch(`/api/user/getAllUsers${cacheBuster}`, { credentials: "include" })
        ]);
        const bookingsData = await bookingsRes.json();
        const usersData = await usersRes.json();
        
        if(bookingsData.success) setAllBookings(bookingsData.bookings);
        if(Array.isArray(usersData)) setAllUsers(usersData);
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCustomerDetails = (booking) => {
    const buyerId = typeof booking?.buyer === "string" ? booking.buyer : (booking?.buyer?._id || booking?.userId);
    const matchedUser = allUsers.find((u) => u._id === buyerId);
    
    if (matchedUser) return { name: matchedUser.username, phone: matchedUser.phone || "No Phone", email: matchedUser.email };
    if (booking?.buyer?.username) return { name: booking.buyer.username, phone: booking.buyer.phone || "No Phone", email: booking.buyer.email };
    if (booking?.userId?.username) return { name: booking.userId.username, phone: booking.userId.phone || "No Phone", email: booking.userId.email };
    return { name: "Guest / Deleted User", phone: "N/A", email: "N/A" };
  };

  const filteredBookings = allBookings.filter(b => {
    const customer = getCustomerDetails(b);
    const nameMatch = (b?.packageDetails?.packageName || "").toLowerCase().includes(search.toLowerCase()) || 
                      customer.name.toLowerCase().includes(search.toLowerCase()) ||
                      customer.phone.includes(search);
    
    const transactionDate = new Date(b?.createdAt || b?.date);
    const today = new Date();
    let dateMatch = true;

    if (dateFilter === "today") {
      dateMatch = transactionDate.toDateString() === today.toDateString();
    } else if (dateFilter === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      dateMatch = transactionDate >= oneWeekAgo;
    } else if (dateFilter === "monthly") {
      dateMatch = transactionDate.getMonth() === today.getMonth() && transactionDate.getFullYear() === today.getFullYear();
    } else if (dateFilter === "custom" && customDate) {
      dateMatch = transactionDate.toISOString().split("T")[0] === customDate;
    }

    return nameMatch && dateMatch;
  });

  // PERFECT FIX: Strictly checks both status fields to exclude all cancelled funds
  const activeIncomeBookings = filteredBookings.filter(b => 
    b.status !== "Cancelled" && b.bookingStatus !== "Cancelled"
  );
  
  const totalIncome = activeIncomeBookings.reduce((sum, b) => sum + (Number(b?.totalPrice) || 0), 0);

  const downloadCSV = () => {
    const headers = ["Package Name", "Customer Name", "Phone", "Travel Date", "Booking Status", "Amount (BDT)"];
    const rows = filteredBookings.map(b => {
      const c = getCustomerDetails(b);
      const isCancelled = b.status === "Cancelled" || b.bookingStatus === "Cancelled";
      return [
        `"${b?.packageDetails?.packageName || b?.packageId?.packageName || "Deleted Package"}"`,
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${new Date(b?.date || b?.travelDate).toLocaleDateString()}"`,
        `"${b.status}"`,
        isCancelled ? "0 (Refunded)" : (b?.totalPrice || 0)
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Income_Report_${dateFilter}.csv`;
    link.click();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex items-center bg-gray-50 border-2 border-gray-200 rounded-lg px-3 focus-within:border-[#EB662B] transition">
          <FaSearch className="text-gray-400" />
          <input className="w-full p-3 bg-transparent outline-none" type="text" placeholder="Search Payments, Names, or Phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-lg px-3">
            <FaFilter className="text-gray-400 mr-2" />
            <select className="p-3 bg-transparent outline-none cursor-pointer text-gray-700 font-semibold" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="lifetime">Lifetime Income</option>
              <option value="today">Today's Income</option>
              <option value="weekly">This Week (Last 7 Days)</option>
              <option value="monthly">This Month</option>
              <option value="custom">Specific Date</option>
            </select>
          </div>
          
          {dateFilter === "custom" && (
            <input type="date" className="p-3 border-2 border-gray-200 rounded-lg outline-none text-gray-700 cursor-pointer" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-green-100 font-bold uppercase tracking-wider text-sm">
            {dateFilter === "custom" ? `Net Income for ${customDate || "Selected Date"}` : `Net ${dateFilter} Income`}
          </p>
          <h2 className="text-3xl md:text-4xl font-black mt-1">৳ {totalIncome.toLocaleString()} BDT</h2>
          <p className="text-sm mt-1 opacity-90">*Excludes Cancelled Bookings</p>
        </div>
        <button onClick={downloadCSV} className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold shadow hover:bg-gray-50 transition flex items-center gap-2 w-full md:w-auto justify-center">
          <FaDownload /> Export Sheet
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading && <p className="text-center py-6 font-bold text-gray-500">Loading Payment Data...</p>}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider"><th className="p-4">Package</th><th className="p-4">Customer Info</th><th className="p-4">Travel Date</th><th className="p-4">Status</th><th className="p-4 text-right">Amount</th></tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredBookings.length === 0 ? (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-500">No records found.</td></tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const pkg = booking?.packageDetails || booking?.packageId || {};
                    const customer = getCustomerDetails(booking);
                    const isCancelled = booking.status === "Cancelled" || booking.bookingStatus === "Cancelled";

                    return (
                      <tr key={booking._id} className={`transition ${isCancelled ? "bg-red-50 opacity-80" : "hover:bg-gray-50"}`}>
                        <td className="p-4 flex items-center gap-3">
                          <img className="w-10 h-10 rounded object-cover border" src={getImgUrl(pkg)} alt="img" />
                          {pkg?._id ? (
                            <Link to={`/package/${pkg._id}`} className="font-bold hover:text-[#EB662B] line-clamp-2">{pkg?.packageName || "Unknown"}</Link>
                          ) : (
                            <span className="font-bold text-gray-500">Deleted Package</span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500 font-semibold">{customer.phone}</p>
                        </td>
                        <td className="p-4 font-bold text-[#6358DC]">{new Date(booking?.date || booking?.travelDate).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${isCancelled ? "bg-red-200 text-red-800" : "bg-green-100 text-green-700"}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className={`p-4 font-black text-right ${isCancelled ? "text-gray-400 line-through" : "text-green-600"}`}>
                          ৳ {booking?.totalPrice || 0}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Payments;