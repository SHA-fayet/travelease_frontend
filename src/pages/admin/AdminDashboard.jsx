import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  logOutStart, logOutSuccess, logOutFailure,
  deleteUserAccountStart, deleteUserAccountSuccess, deleteUserAccountFailure,
} from "../../redux/user/userSlice";
import AllBookings from "./AllBookings";
import AdminUpdateProfile from "./AdminUpdateProfile";
import AddPackages from "./AddPackages";
import "./styles/DashboardStyle.css";
import AllPackages from "./AllPackages";
import AllUsers from "./AllUsers";
import Payments from "./Payments";
import RatingsReviews from "./RatingsReviews";
import History from "./History";
import { toast } from "react-toastify";
import { 
  FaUserShield, FaEdit, FaSignOutAlt, FaTrash, 
  FaMoneyBillWave, FaClipboardList, FaBoxOpen, FaUsers, FaBell, FaCheckCircle, FaTimes
} from "react-icons/fa";

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const timestamp = new Date().getTime(); 
  if (avatarPath.startsWith("http")) return `${avatarPath}?t=${timestamp}`;
  return `http://localhost:8000/images/${avatarPath}?t=${timestamp}`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  
  const [activePanelId, setActivePanelId] = useState(1);
  const [formData, setFormData] = useState({ username: "", email: "", address: "", phone: "", avatar: null });
  const [stats, setStats] = useState({ totalUsers: 0, activeBookings: 0, totalPackages: 0, netRevenue: 0 });
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username, email: currentUser.email, address: currentUser.address, phone: currentUser.phone, avatar: currentUser.avatar,
      });
    }
  }, [currentUser]);

  const fetchStatsAndNotifications = async () => {
    try {
      const cacheBuster = `?nocache=${new Date().getTime()}`;
      
      const [bookingsRes, packagesRes, usersRes] = await Promise.all([
        fetch(`/api/booking/get-allBookings${cacheBuster}`, { credentials: "include" }),
        fetch(`/api/package/get-packages${cacheBuster}`, { credentials: "include" }),
        fetch(`/api/user/getAllUsers${cacheBuster}`, { credentials: "include" }),
      ]);

      const bData = await bookingsRes.json();
      const pData = await packagesRes.json();
      const uData = await usersRes.json();

      const validBookings = bData?.success ? bData.bookings : [];
      
      const activeOnly = validBookings.filter(b => b.status !== "Cancelled" && b.bookingStatus !== "Cancelled");
      const totalNetRevenue = activeOnly.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

      setStats({
        totalUsers: Array.isArray(uData) ? uData.length : 0,
        activeBookings: activeOnly.length,
        totalPackages: pData?.success ? pData.packages.length : 0,
        netRevenue: totalNetRevenue
      });

      const pendingCancellations = validBookings.filter(b => b.status === "Cancellation Requested");
      setNotifications(pendingCancellations);

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    }
  };

  useEffect(() => {
    let intervalId;
    if (currentUser?.user_role === 1) {
      fetchStatsAndNotifications(); 
      intervalId = setInterval(() => {
        fetchStatsAndNotifications();
      }, 5000); 
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentUser, activePanelId]);

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/auth/logout");
      const data = await res.json();
      if (!data?.success) return dispatch(logOutFailure(data?.message));
      dispatch(logOutSuccess());
      navigate("/login");
      toast.success(data?.message);
    } catch (error) { console.error(error); }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure? The account will be permanently deleted!")) {
      try {
        dispatch(deleteUserAccountStart());
        const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: "DELETE" });
        const data = await res.json();
        if (data?.success === false) { dispatch(deleteUserAccountFailure(data?.message)); return toast.error("Something went wrong!"); }
        dispatch(deleteUserAccountSuccess());
        toast.success(data?.message);
      } catch (error) { console.error(error); }
    }
  };

  const handleApproveCancellation = async (bookingId) => {
    if(!window.confirm("Approve cancellation? This will permanently cancel the booking and remove the income.")) return;
    try {
      const res = await fetch(`/api/booking/cancel-booking/${bookingId}/${currentUser._id}`, { 
        method: "POST", 
        headers: { "Content-Type":"application/json" }, 
        body: JSON.stringify({ reason: "Admin Approved User Cancellation" }) 
      });
      const data = await res.json();
      if (data?.success) { 
        toast.success("Cancellation Approved Successfully"); 
        setShowNotifications(false); 
        fetchStatsAndNotifications(); 
      } else { 
        toast.error(data?.message); 
      }
    } catch (error) { console.error(error); }
  };

  if (!currentUser) return <div className="text-center py-20 text-red-700 font-bold text-xl">Please Login First</div>;

  return (
    <div className="flex w-full flex-col md:flex-row gap-6 p-4 max-w-[1500px] mx-auto min-h-screen">
      
      <div className="w-full md:w-[25%] flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#EB662B] to-[#6358DC] opacity-90"></div>
          <img src={getAvatarUrl(formData.avatar)} alt="Admin Profile" className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md z-10 mt-6" />
          <div className="z-10 mt-4 flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-sm">
            <FaUserShield size={14} /> System Admin
          </div>
          <button onClick={() => setActivePanelId(8)} className="w-full mt-6 bg-[#EB662B] text-white font-bold py-2.5 rounded-xl hover:bg-[#d55923] transition flex items-center justify-center gap-2 shadow-sm">
            <FaEdit /> Edit Profile
          </button>

          {/* RESTORED PROFILE DETAILS */}
          <div className="w-full mt-6 flex flex-col gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div><p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">Name</p><p className="font-bold text-gray-800">{currentUser.username}</p></div>
            <div><p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">Email</p><p className="font-bold text-gray-800 break-all">{currentUser.email}</p></div>
            <div><p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">Phone</p><p className="font-bold text-gray-800">{currentUser.phone || "N/A"}</p></div>
          </div>

          {/* RESTORED LOGOUT & DELETE BUTTONS */}
          <div className="w-full flex gap-3 mt-6">
            <button onClick={handleLogout} className="flex-1 bg-white text-gray-700 font-bold py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center gap-2"><FaSignOutAlt /> Logout</button>
            <button onClick={handleDeleteAccount} className="flex-1 bg-red-50 text-red-600 font-bold py-2.5 rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-2"><FaTrash /> Delete</button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[75%] flex flex-col gap-4">
        
        <div className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center relative z-[100]">
          <h1 className="text-xl font-black text-gray-800 uppercase tracking-wider">Dashboard Overview</h1>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition relative flex items-center justify-center text-gray-600"
            >
              <FaBell size={22} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse shadow-md">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-4 w-[350px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[999]">
                <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Action Required</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-700"><FaTimes /></button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 font-medium">No pending requests.</div>
                  ) : (
                    notifications.map(notif => {
                      const customer = notif?.buyer || notif?.userId || notif?.user || {};
                      const customerName = customer?.username || "A Customer";
                      
                      const pkg = notif?.packageDetails || notif?.packageId || {};
                      const pkgName = pkg?.packageName || "an unknown package";
                      
                      return (
                        <div key={notif._id} className="p-4 border-b hover:bg-gray-50 flex flex-col gap-2 transition">
                          <div className="flex justify-between items-start">
                            <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase px-2 py-1 rounded">Cancellation Request</span>
                            <span className="text-xs font-bold text-gray-500">{new Date(notif.updatedAt || notif.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-800 mt-1">
                            <span className="font-bold">{customerName}</span> requested to cancel their booking for <span className="font-bold text-[#EB662B]">{pkgName}</span>.
                          </p>
                          <div className="bg-gray-100 p-2 rounded text-xs text-gray-600 italic border-l-4 border-gray-300">
                            "{notif.cancellationReason || "No reason provided."}"
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleApproveCancellation(notif._id)} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-xs font-bold transition flex items-center justify-center gap-2">
                              <FaCheckCircle /> Approve Cancel
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col justify-center items-center text-center gap-2">
            <div className="p-3 bg-green-50 text-green-600 rounded-full"><FaMoneyBillWave size={24} /></div>
            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Revenue</p><p className="text-xl font-black text-gray-800 mt-1">৳ {stats.netRevenue.toLocaleString()}</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col justify-center items-center text-center gap-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><FaClipboardList size={24} /></div>
            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Trips</p><p className="text-xl font-black text-gray-800 mt-1">{stats.activeBookings}</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col justify-center items-center text-center gap-2">
            <div className="p-3 bg-orange-50 text-[#EB662B] rounded-full"><FaBoxOpen size={24} /></div>
            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Packages</p><p className="text-xl font-black text-gray-800 mt-1">{stats.totalPackages}</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col justify-center items-center text-center gap-2">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><FaUsers size={24} /></div>
            <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Users</p><p className="text-xl font-black text-gray-800 mt-1">{stats.totalUsers}</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-grow relative z-10">
          <nav className="w-full bg-gray-50 border-b border-gray-200 overflow-x-auto custom-scrollbar">
            <div className="flex px-2">
              {[
                { id: 1, label: "Bookings" }, { id: 2, label: "Add Packages" }, { id: 3, label: "All Packages" },
                { id: 4, label: "Users" }, { id: 5, label: "Payments" }, { id: 6, label: "Ratings/Reviews" }, { id: 7, label: "History" }
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActivePanelId(tab.id)} className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all duration-300 relative ${activePanelId === tab.id ? "text-[#EB662B]" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}>
                  {tab.label}
                  {activePanelId === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#EB662B] rounded-t-md"></div>}
                </button>
              ))}
            </div>
          </nav>
          
          <div className="p-4 md:p-6 bg-gray-50/50 flex-grow">
            {activePanelId === 1 && <AllBookings refreshData={fetchStatsAndNotifications} />}
            {activePanelId === 2 && <AddPackages />}
            {activePanelId === 3 && <AllPackages />}
            {activePanelId === 4 && <AllUsers />}
            {activePanelId === 5 && <Payments />}
            {activePanelId === 6 && <RatingsReviews />}
            {activePanelId === 7 && <History refreshData={fetchStatsAndNotifications} />}
            {activePanelId === 8 && <AdminUpdateProfile />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;