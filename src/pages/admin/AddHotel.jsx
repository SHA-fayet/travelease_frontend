import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AddHotel = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", location: "", description: "", pricePerNight: "", roomType: "Standard", amenities: "", images: []
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleFile = (e) => setFormData({ ...formData, images: Array.from(e.target.files) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.pricePerNight) return toast.error("Required fields missing!");

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== "images") data.append(key, formData[key]);
    });
    formData.images.forEach(image => data.append("images", image));

    try {
      setLoading(true);
      const res = await fetch(`/api/services/hotel/create`, {
        method: "POST", credentials: "include", body: data,
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      toast.success("Hotel listed successfully!");
      navigate(currentUser?.user_role === 2 ? "/agency-dashboard" : "/profile/admin");
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 w-full min-h-screen flex items-center justify-center bg-[#EB662B] text-white rounded-lg py-10">
      <div className="w-[95%] md:w-[80%] mx-auto flex flex-col gap-6 rounded-xl shadow-xl py-8 px-4">
        <h1 className="text-center text-3xl font-bold text-white">Add <span className="">Hotel</span></h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col"><label>Hotel Name:</label><input type="text" id="name" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" required /></div>
            <div className="flex-1 flex flex-col"><label>Location:</label><input type="text" id="location" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" required /></div>
          </div>
          <div className="flex flex-col"><label>Description:</label><textarea id="description" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none resize-none" rows="3" required /></div>
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col"><label>Price Per Night (BDT):</label><input type="number" id="pricePerNight" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" required /></div>
            <div className="flex-1 flex flex-col"><label>Room Type:</label><input type="text" id="roomType" placeholder="e.g., Deluxe, Suite" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" /></div>
          </div>
          <div className="flex flex-col"><label>Amenities (Comma separated):</label><input type="text" id="amenities" placeholder="WiFi, Pool, AC" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" /></div>
          <div className="flex flex-col"><label>Upload Images:</label><input type="file" multiple accept="image/*" onChange={handleFile} className="p-2 bg-white text-black rounded" /></div>
          <button type="submit" disabled={loading} className="p-3 rounded bg-black text-white font-bold hover:opacity-90 mt-2">{loading ? "Saving..." : "List Hotel"}</button>
        </form>
      </div>
    </div>
  );
};
export default AddHotel;