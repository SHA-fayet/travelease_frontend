import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaUsers, FaBoxOpen, FaClipboardList, FaMoneyBillWave, 
  FaStar, FaHistory, FaPlusCircle, FaTrash, FaCheckCircle, FaUserShield 
} from "react-icons/fa";

const AdminPanel = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalPackages: 0,
    totalRevenue: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Admin Stats & Overview Data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, packagesRes, usersRes] = await Promise.all([
        fetch("/api/booking/get-all-bookings", { credentials: "include" }),
        fetch("/api/package/get-packages", { credentials: "include" }),
        fetch("/api/user/getAllUsers", { credentials: "include" }),
      ]);

      const bookingsData = await bookingsRes.json();
      const packagesData = await packagesRes.json();
      const usersData = await usersRes.json();

      const validBookings = bookingsData?.success ? bookingsData.bookings : [];
      const validPackages = packagesData?.success ? packagesData.packages : [];
      const validUsers = Array.isArray(usersData) ? usersData : [];

      setBookings(validBookings);
      setPackages(validPackages);
      setUsers(validUsers);

      // Calculate total revenue from paid bookings
      const revenue = validBookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

      setStats({
        totalUsers: validUsers.length,
        totalBookings: validBookings.length,
        totalPackages: validPackages.length,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.user_role === 1) {
      fetchAdminData();
    }
  }, [currentUser]);

  // Handle Admin Booking Cancellation / Approval
  const handleAdminCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking as Admin?")) return;
    try {
      const res = await fetch(`/api/booking/cancel-booking/${bookingId}/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: "Cancelled directly by Administrator" })
      });
      const data = await res.json();
      if (data?.success) {
        toast.success("Booking cancelled successfully");
        fetchAdminData();
      } else {
        toast.error(data?.message || "Failed to cancel");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle User Deletion by Admin
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      const res = await fetch(`/api/user/delete-user/${userId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (data?.success) {
        toast.success("User deleted successfully");
        fetchAdminData();
      } else {
        toast.error(data?.message || "Failed to delete user");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-[#6358DC] to-[#EB662B] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <FaUserShield /> Admin Management Dashboard
          </h1>
          <p className="text-purple-100 text-sm mt-1">
            Welcome back, {currentUser?.username}. Monitor platform analytics, bookings, packages, and users in real-time.
          </p>
        </div>
        {/* Admin Self-Booking Button */}
        <button
          onClick={() => navigate("/search")}
          className="bg-white text-gray-900 font-bold px-6 py-3 rounded-xl shadow hover:bg-gray-100 transition flex items-center gap-2 shrink-0"
        >
          <FaPlusCircle className="text-[#EB662B]" /> Book Trip For Myself
        </button>
      </div>

      {/* Interactive Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-[#6358DC] rounded-xl text-2xl"><FaMoneyBillWave /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Total Revenue</p>
            <h3 className="text-2xl font-black text-gray-900">৳ {stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-[#EB662B] rounded-xl text-2xl"><FaClipboardList /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Total Bookings</p>
            <h3 className="text-2xl font-black text-gray-900">{stats.totalBookings}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl text-2xl"><FaBoxOpen /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Active Packages</p>
            <h3 className="text-2xl font-black text-gray-900">{stats.totalPackages}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl text-2xl"><FaUsers /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Registered Users</p>
            <h3 className="text-2xl font-black text-gray-900">{stats.totalUsers}</h3>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-xl border shadow-sm p-2 flex gap-2 overflow-x-auto">
        <button onClick={() => setActiveTab("overview")} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === "overview" ? "bg-[#6358DC] text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          All Bookings
        </button>
        <button onClick={() => setActiveTab("packages")} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === "packages" ? "bg-[#6358DC] text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          Packages Manager
        </button>
        <button onClick={() => setActiveTab("users")} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === "users" ? "bg-[#6358DC] text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          Users List
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-semibold">Loading admin panel data...</div>
        ) : (
          <>
            {/* BOOKINGS TAB */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-3">All Customer & Admin Bookings</h3>
                {bookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bookings recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                          <th className="p-3">Package ID</th>
                          <th className="p-3">User / Buyer</th>
                          <th className="p-3">Travel Date</th>
                          <th className="p-3">Travelers</th>
                          <th className="p-3">Total Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {bookings.map((b) => (
                          <tr key={b._id} className="hover:bg-gray-50 transition">
                            <td className="p-3 font-medium text-indigo-600 truncate max-w-[120px]">{b.packageId || b.packageDetails}</td>
                            <td className="p-3 text-gray-700">{b.buyer?.username || b.userId || "N/A"}</td>
                            <td className="p-3 text-gray-600">{new Date(b.date || b.travelDate).toLocaleDateString()}</td>
                            <td className="p-3 text-gray-600">{b.persons || b.travelersCount} Person(s)</td>
                            <td className="p-3 font-bold text-[#EB662B]">৳ {b.totalPrice}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${b.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {b.status !== "Cancelled" && (
                                <button onClick={() => handleAdminCancel(b._id)} className="px-3 py-1 bg-red-50 text-red-600 font-semibold rounded border border-red-200 hover:bg-red-600 hover:text-white transition text-xs">
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PACKAGES TAB */}
            {activeTab === "packages" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-lg font-bold text-gray-800">Manage Travel Packages</h3>
                  <button onClick={() => navigate("/admin/add-package")} className="bg-[#6358DC] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition flex items-center gap-2">
                    <FaPlusCircle /> Add New Package
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map((pkg) => (
                    <div key={pkg._id} className="border rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm bg-gray-50">
                      <div>
                        <h4 className="font-bold text-gray-900">{pkg.packageName}</h4>
                        <p className="text-xs text-gray-500 mt-1">📍 {pkg.packageDestination}</p>
                        <p className="text-sm font-black text-[#EB662B] mt-2">৳ {pkg.packagePrice}</p>
                      </div>
                      <div className="flex gap-2 border-t pt-3">
                        <button onClick={() => navigate(`/package/${pkg._id}`)} className="flex-1 bg-white border text-gray-700 py-1.5 rounded text-xs font-bold hover:bg-gray-100 transition">
                          View
                        </button>
                        <button onClick={() => navigate(`/admin/update-package/${pkg._id}`)} className="flex-1 bg-[#6358DC] text-white py-1.5 rounded text-xs font-bold hover:opacity-90 transition">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-3">Registered Platform Users</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                        <th className="p-3">Username</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Role</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50 transition">
                          <td className="p-3 font-medium text-gray-900">{u.username}</td>
                          <td className="p-3 text-gray-600">{u.email}</td>
                          <td className="p-3 text-gray-600">{u.phone || "N/A"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.user_role === 1 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                              {u.user_role === 1 ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {u.user_role !== 1 && (
                              <button onClick={() => handleDeleteUser(u._id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white transition">
                                <FaTrash size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;