import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const getImgUrl = (pkg) => {
  // Support both legacy packages and new services
  const images = pkg?.packageImages || pkg?.images;
  if (!images || !Array.isArray(images) || images.length === 0) return "https://via.placeholder.com/150?text=Service";
  return images[0].startsWith("http") ? images[0] : `http://localhost:8000/images/${images[0]}`;
};

const History = ({ refreshData }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [allBookings, setAllBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, usersRes] = await Promise.all([
        fetch(`/api/booking/get-allBookings?searchTerm=${search}`),
        fetch(`/api/user/getAllUsers`, { credentials: "include" })
      ]);
      const bookingsData = await bookingsRes.json();
      const usersData = await usersRes.json();
      
      if (bookingsData?.success) setAllBookings(bookingsData?.bookings);
      if (Array.isArray(usersData)) setAllUsers(usersData);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const getCustomerDetails = (booking) => {
    const buyerId = typeof booking?.buyer === "string" ? booking.buyer : (booking?.buyer?._id || booking?.userId);
    const matchedUser = allUsers.find((u) => u._id === buyerId);
    if (matchedUser) return { name: matchedUser.username, phone: matchedUser.phone || "No Phone" };
    if (booking?.buyer?.username) return { name: booking.buyer.username, phone: booking.buyer.phone || "No Phone" };
    return { name: "Guest / Deleted", phone: "N/A" };
  };

  const handleHistoryDelete = async (id) => {
    if(!window.confirm("Admin Warning: Permanently delete this history record?")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/booking/delete-booking-history/${id}/${currentUser._id}`, { method: "DELETE" });
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

  return (
    <div className="w-full flex flex-col gap-6">
      <input className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#EB662B]" type="text" placeholder="Search Past Records..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider"><th className="p-4">Item Booked</th><th className="p-4">Customer Info</th><th className="p-4">Travel Date</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
            </thead>
            <tbody className="divide-y text-sm">
              {allBookings.map((booking) => {
                const pkg = booking?.packageDetails || booking?.packageId || booking?.serviceId || {};
                const isService = booking?.itemType && booking.itemType !== "Package";
                const itemName = isService ? (booking.serviceName || "Standalone Service") : (pkg?.packageName || "Deleted Package");
                const itemLink = isService ? "/services" : (pkg?._id ? `/package/${pkg._id}` : null);
                
                const customer = getCustomerDetails(booking);
                const isCancelled = booking.status === "Cancelled";

                return (
                  <tr key={booking._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img className="w-10 h-10 rounded object-cover border" src={getImgUrl(pkg)} alt="img" />
                      {itemLink ? (
                        <Link to={itemLink} className="font-bold hover:text-[#EB662B] line-clamp-1">{itemName}</Link>
                      ) : (
                        <span className="font-bold text-gray-500">{itemName}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold">{customer.name}</p>
                      <p className="text-xs text-gray-500 font-semibold">{customer.phone}</p>
                    </td>
                    <td className="p-4 font-bold text-[#6358DC]">
                      {new Date(booking?.date || booking?.travelDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${isCancelled ? "bg-red-200 text-red-800" : "bg-green-100 text-green-700"}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleHistoryDelete(booking._id)} className="px-4 py-2 bg-red-50 text-red-600 rounded font-bold hover:bg-red-600 hover:text-white transition">Delete</button>
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
export default History;