import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  logOutStart, logOutSuccess, logOutFailure,
  deleteUserAccountStart, deleteUserAccountSuccess, deleteUserAccountFailure,
} from "../redux/user/userSlice";

import MyBookings from "./user/MyBookings";
import UpdateProfile from "./user/UpdateProfile";
import MyHistory from "./user/MyHistory";
import AdminPanel from "./user/AdminPanel";
import AgencyDashboard from "./agency/AgencyDashboard"; // <-- Import Agency Dashboard
import { toast } from "react-toastify";

const getAvatarSrc = (avatarPath) => {
  if (!avatarPath) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const timestamp = new Date().getTime(); 
  if (avatarPath.startsWith("http")) return `${avatarPath}?t=${timestamp}`;
  return `http://localhost:8000/images/${avatarPath}?t=${timestamp}`;
};

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const [activePanelId, setActivePanelId] = useState(1);

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch("/api/auth/logout", {
        credentials: "include"
      });
      const data = await res.json();
      if (!data?.success) {
        dispatch(logOutFailure(data?.message));
        return;
      }
      dispatch(logOutSuccess());
      navigate("/login");
      toast.success(data?.message);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const CONFIRM = window.confirm("Are you sure? The account will be permanently deleted!");
    if (CONFIRM) {
      try {
        dispatch(deleteUserAccountStart());
        const res = await fetch(`/api/user/delete/${currentUser._id}`, {
          method: "DELETE",
          credentials: "include"
        });
        const data = await res.json();
        if (data?.success === false) {
          dispatch(deleteUserAccountFailure(data?.message));
          toast.error("Something went wrong!");
          return;
        }
        dispatch(deleteUserAccountSuccess());
        toast.success(data?.message);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex w-full flex-wrap max-sm:flex-col p-2">
      {currentUser ? (
        <>
          {/* Left Profile Section */}
          <div className="w-full md:w-[25%] p-3">
            <div className="flex flex-col items-center gap-4 p-4 rounded-xl shadow-lg bg-white border">
              
              <div className="w-full flex flex-col items-center relative my-2">
                <img
                  src={getAvatarSrc(currentUser?.avatar)}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                  alt="avatar"
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#6358DC] shadow-md"
                />
              </div>

              {/* Role Badge */}
              <span className={`font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
                currentUser?.user_role === 1 ? "bg-orange-50 text-[#EB662B]" :
                currentUser?.user_role === 2 ? "bg-teal-50 text-teal-600" :
                "bg-indigo-50 text-[#6358DC]"
              }`}>
                {currentUser?.user_role === 1 ? "Admin Account" : currentUser?.user_role === 2 ? "Partner Agency" : "Traveler Account"}
              </span>

              <div className="w-full">
                <button onClick={() => setActivePanelId(4)} className="w-full bg-[#6358DC] text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition">
                  Edit Profile
                </button>
              </div>

              <div className="w-full flex flex-col gap-2 mt-2">
                <div className="flex flex-col border-b pb-2">
                  <span className="text-xs text-gray-500 uppercase font-bold">Name</span>
                  <span className="text-gray-900 font-medium break-words">{currentUser.username}</span>
                </div>
                {currentUser?.agencyName && (
                  <div className="flex flex-col border-b pb-2">
                    <span className="text-xs text-gray-500 uppercase font-bold">Agency Name</span>
                    <span className="text-teal-700 font-bold break-words">{currentUser.agencyName}</span>
                  </div>
                )}
                <div className="flex flex-col border-b pb-2">
                  <span className="text-xs text-gray-500 uppercase font-bold">Email</span>
                  <span className="text-gray-900 font-medium break-words">{currentUser.email}</span>
                </div>
                <div className="flex flex-col border-b pb-2">
                  <span className="text-xs text-gray-500 uppercase font-bold">Phone</span>
                  <span className="text-gray-900 font-medium break-words">{currentUser.phone}</span>
                </div>
                <div className="flex flex-col pb-2">
                  <span className="text-xs text-gray-500 uppercase font-bold">Address</span>
                  <span className="text-gray-900 font-medium break-words">{currentUser.address}</span>
                </div>
                
                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t">
                  <button onClick={handleLogout} className="flex-1 bg-gray-100 text-gray-800 border font-bold py-2 rounded-lg hover:bg-gray-200 transition">
                    Logout
                  </button>
                  <button onClick={handleDeleteAccount} className="flex-1 bg-red-50 text-red-600 border border-red-200 font-bold py-2 rounded-lg hover:bg-red-600 hover:text-white transition">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-[75%] p-3">
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <nav className="w-full border-b bg-gray-50 flex overflow-x-auto">
                <button onClick={() => setActivePanelId(1)} className={`px-6 py-4 font-bold transition whitespace-nowrap ${activePanelId === 1 ? "bg-white text-[#6358DC] border-b-2 border-[#6358DC]" : "text-gray-600 hover:bg-gray-100"}`}>
                  My Bookings
                </button>
                <button onClick={() => setActivePanelId(2)} className={`px-6 py-4 font-bold transition whitespace-nowrap ${activePanelId === 2 ? "bg-white text-[#6358DC] border-b-2 border-[#6358DC]" : "text-gray-600 hover:bg-gray-100"}`}>
                  Travel History
                </button>

                {currentUser?.user_role === 1 && (
                  <button onClick={() => setActivePanelId(3)} className={`px-6 py-4 font-bold transition whitespace-nowrap ${activePanelId === 3 ? "bg-white text-[#EB662B] border-b-2 border-[#EB662B]" : "text-[#EB662B] hover:bg-orange-50"}`}>
                    Admin Dashboard
                  </button>
                )}

                {currentUser?.user_role === 2 && (
                  <button onClick={() => setActivePanelId(5)} className={`px-6 py-4 font-bold transition whitespace-nowrap ${activePanelId === 5 ? "bg-white text-teal-600 border-b-2 border-teal-600" : "text-teal-600 hover:bg-teal-50"}`}>
                    Agency Dashboard
                  </button>
                )}

                <button onClick={() => setActivePanelId(4)} className={`px-6 py-4 font-bold transition whitespace-nowrap ${activePanelId === 4 ? "bg-white text-[#6358DC] border-b-2 border-[#6358DC]" : "text-gray-600 hover:bg-gray-100"}`}>
                  Settings
                </button>
              </nav>

              <div className="p-4 bg-gray-50 min-h-[600px]">
                {activePanelId === 1 && <MyBookings />}
                {activePanelId === 2 && <MyHistory />}
                {activePanelId === 3 && currentUser?.user_role === 1 && <AdminPanel />}
                {activePanelId === 5 && currentUser?.user_role === 2 && <AgencyDashboard />}
                {activePanelId === 4 && <UpdateProfile />}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full text-center py-20">
          <p className="text-red-700 text-xl font-semibold">Please Login First</p>
        </div>
      )}
    </div>
  );
};

export default Profile;