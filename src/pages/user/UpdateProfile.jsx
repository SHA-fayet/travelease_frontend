import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateUserStart, updateUserSuccess, updateUserFailure, updatePassStart, updatePassSuccess, updatePassFailure } from "../../redux/user/userSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { FiUpload } from "react-icons/fi";

// Cache buster forces the browser to refresh the image immediately
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const timestamp = new Date().getTime(); 
  if (avatarPath.startsWith("http")) return `${avatarPath}?t=${timestamp}`;
  return `http://localhost:8000/images/${avatarPath}?t=${timestamp}`;
};

const UpdateProfile = () => {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [updateProfileDetailsPanel, setUpdateProfileDetailsPanel] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", address: "", phone: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [updatePassword, setUpdatePassword] = useState({ oldpassword: "", newpassword: "" });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        address: currentUser.address || "",
        phone: currentUser.phone || "",
      });
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const updateUserDetails = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const updatedForm = new FormData();
      updatedForm.append("username", formData.username);
      updatedForm.append("email", formData.email);
      updatedForm.append("address", formData.address);
      updatedForm.append("phone", formData.phone);
      if (avatarFile) updatedForm.append("avatar", avatarFile); 

      const res = await axios.post(`/api/user/update/${currentUser._id}`, updatedForm, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true // CRITICAL FIX: Sends auth cookie with the image upload
      });
      
      if (res.data.success) {
        toast.success("Profile Updated Successfully!");
        dispatch(updateUserSuccess(res.data.user)); // Updates Redux state with new avatar string
        setAvatarFile(null);
        setAvatarPreview("");
      } else {
        dispatch(updateUserFailure(res.data.message));
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      dispatch(updateUserFailure("Update failed"));
      toast.error("Failed to update profile");
    }
  };

  const handlePass = (e) => setUpdatePassword({ ...updatePassword, [e.target.name]: e.target.value });

  const updateUserPassword = async (e) => {
    e.preventDefault();
    if (!updatePassword.oldpassword || !updatePassword.newpassword) return toast.error("Enter a valid password");
    if (updatePassword.oldpassword === updatePassword.newpassword) return toast.error("New password can't be same!");
    
    try {
      dispatch(updatePassStart());
      const res = await fetch(`/api/user/update-password/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // CRITICAL FIX: Sends auth cookie for password update
        body: JSON.stringify(updatePassword),
      });
      const data = await res.json();
      
      if (data.success === false && res.status !== 201 && res.status !== 200) {
        dispatch(updatePassFailure(data?.message));
        toast.error(data?.message || "Session Ended! Please login again");
        navigate("/login");
        return;
      }
      
      dispatch(updatePassSuccess());
      toast.success(data?.message);
      setUpdatePassword({ oldpassword: "", newpassword: "" });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full flex justify-center pb-10">
      <div className="w-full max-w-2xl bg-white border mx-auto flex flex-col gap-6 rounded-xl shadow-sm p-6">
        <h1 className="text-center text-xl font-bold text-gray-800 border-b pb-4">
          {updateProfileDetailsPanel ? "Update Profile" : "Change Password"}
        </h1>

        <div className="flex flex-col gap-5">
          {updateProfileDetailsPanel ? (
            <form className="w-full space-y-4">
              <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl border">
                <img src={avatarPreview || getAvatarUrl(currentUser?.avatar)} alt="Profile" className="w-16 h-16 object-cover rounded-full border-2 border-[#6358DC]" />
                <label htmlFor="avatarUpload" className="cursor-pointer flex items-center gap-2 bg-[#6358DC] text-white px-4 py-2 rounded-lg hover:opacity-90 transition text-sm">
                  <FiUpload /> Choose New Avatar
                </label>
                <input type="file" id="avatarUpload" onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              <div><label className="text-sm font-semibold">Username</label><input type="text" name="username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 outline-none focus:border-[#6358DC]" /></div>
              <div><label className="text-sm font-semibold">Email</label><input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 outline-none focus:border-[#6358DC]" /></div>
              <div><label className="text-sm font-semibold">Phone</label><input type="text" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 outline-none focus:border-[#6358DC]" /></div>
              <div><label className="text-sm font-semibold">Address</label><textarea name="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 outline-none focus:border-[#6358DC] h-24 resize-none" /></div>
              
              <div className="flex gap-4 pt-2">
                <button disabled={loading} onClick={updateUserDetails} type="button" className="flex-1 bg-[#6358DC] text-white p-3 rounded-lg font-bold hover:opacity-90 transition">
                  {loading ? "Updating..." : "Save Changes"}
                </button>
                <button disabled={loading} type="button" onClick={() => setUpdateProfileDetailsPanel(false)} className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-bold hover:bg-gray-300 transition">
                  Change Password
                </button>
              </div>
            </form>
          ) : (
            <form className="w-full space-y-4">
              <div><label className="text-sm font-semibold">Old Password</label><input type="password" name="oldpassword" value={updatePassword.oldpassword} onChange={handlePass} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 outline-none focus:border-[#6358DC]" /></div>
              <div><label className="text-sm font-semibold">New Password</label><input type="password" name="newpassword" value={updatePassword.newpassword} onChange={handlePass} className="w-full mt-1 p-3 border rounded-lg bg-gray-50 outline-none focus:border-[#6358DC]" /></div>
              
              <div className="flex gap-4 pt-4">
                <button disabled={loading} onClick={updateUserPassword} type="button" className="flex-1 bg-[#6358DC] text-white p-3 rounded-lg font-bold hover:opacity-90 transition">
                  {loading ? "Updating..." : "Update Password"}
                </button>
                <button disabled={loading} type="button" onClick={() => { setUpdateProfileDetailsPanel(true); setUpdatePassword({ oldpassword: "", newpassword: "" }); }} className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-bold hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;