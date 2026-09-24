import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserStart, updateUserSuccess, updateUserFailure, updatePassStart, updatePassSuccess, updatePassFailure } from "../../redux/user/userSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { FiUpload } from "react-icons/fi";

const AdminUpdateProfile = () => {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [updateProfileDetailsPanel, setUpdateProfileDetailsPanel] = useState(true);
  const [formData, setFormData] = useState({ username: "", address: "", phone: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [updatePassword, setUpdatePassword] = useState({ oldpassword: "", newpassword: "" });

  useEffect(() => {
    if (currentUser) {
      setFormData({ username: currentUser.username, address: currentUser.address, phone: currentUser.phone });
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if(file){
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const updateUserDetails = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const updatedForm = new FormData();
      updatedForm.append("username", formData.username);
      updatedForm.append("address", formData.address);
      updatedForm.append("phone", formData.phone);
      if (avatarFile) updatedForm.append("avatar", avatarFile);

      const res = await axios.post(`/api/user/update/${currentUser._id}`, updatedForm, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(updateUserSuccess(res.data.user));
      } else {
        dispatch(updateUserFailure(res.data.message));
        toast.error(res.data.message);
      }
    } catch (error) {
      dispatch(updateUserFailure("Error"));
      toast.error("Something went wrong");
    }
  };

  // ... keep updateUserPassword logic identical to before ...

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white flex flex-col gap-6 rounded-xl shadow-md border p-8">
        <h1 className="text-center text-2xl font-black text-gray-800 border-b pb-4">Admin Security & Profile</h1>
        <form className="w-full space-y-4">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-16 h-16 object-cover rounded-full border-2" />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">Img</div>
            )}
            <label htmlFor="avatarUpload" className="cursor-pointer bg-[#EB662B] text-white px-4 py-2 rounded font-bold flex items-center gap-2"><FiUpload /> Upload Avatar</label>
            <input type="file" id="avatarUpload" onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div><label className="font-bold text-gray-700">Username</label><input type="text" name="username" value={formData.username} onChange={(e)=>setFormData({...formData, username: e.target.value})} className="w-full mt-2 p-3 border rounded-lg bg-gray-50 outline-none" /></div>
          <div><label className="font-bold text-gray-700">Phone</label><input type="text" name="phone" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="w-full mt-2 p-3 border rounded-lg bg-gray-50 outline-none" /></div>
          <div><label className="font-bold text-gray-700">Address</label><textarea name="address" value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} className="w-full mt-2 p-3 border rounded-lg bg-gray-50 outline-none resize-none" /></div>

          <button disabled={loading} onClick={updateUserDetails} type="button" className="w-full bg-[#EB662B] text-white font-bold p-3 rounded-lg hover:opacity-90">{loading ? "Updating..." : "Save Changes"}</button>
        </form>
      </div>
    </div>
  );
};
export default AdminUpdateProfile;