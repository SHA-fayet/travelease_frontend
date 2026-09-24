import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AddTransport = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    operatorName: "", vehicleType: "", departureLocation: "", arrivalLocation: "", departureTime: "", price: "", features: "", images: []
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleFile = (e) => setFormData({ ...formData, images: Array.from(e.target.files) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== "images") data.append(key, formData[key]);
    });
    formData.images.forEach(image => data.append("images", image));

    try {
      setLoading(true);
      const res = await fetch(`/api/services/transportation/create`, {
        method: "POST", credentials: "include", body: data,
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      toast.success("Transport listed successfully!");
      navigate(currentUser?.user_role === 2 ? "/agency-dashboard" : "/profile/admin");
    } catch (err) {
      toast.error(err.message || "Failed to add transport");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 w-full min-h-screen flex items-center justify-center bg-[#EB662B] text-white rounded-lg py-10">
      <div className="w-[95%] md:w-[80%] mx-auto flex flex-col gap-6 rounded-xl shadow-xl py-8 px-4">
        <h1 className="text-center text-3xl font-bold text-white">Add <span className="">Transport</span></h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col"><label>Operator Name:</label><input type="text" id="operatorName" placeholder="Green Line, NovoAir" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" required /></div>
            <div className="flex-1 flex flex-col">
              <label>Vehicle Type:</label>
              <select id="vehicleType" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" required>
                <option value="">Select Type</option><option value="Bus">Bus</option><option value="Flight">Flight</option><option value="Train">Train</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col"><label>Departure From:</label><input type="text" id="departureLocation" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" required /></div>
            <div className="flex-1 flex flex-col"><label>Arrival To:</label><input type="text" id="arrivalLocation" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" required /></div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col"><label>Departure Time:</label><input type="datetime-local" id="departureTime" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" required /></div>
            <div className="flex-1 flex flex-col"><label>Price (BDT):</label><input type="number" id="price" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" required /></div>
          </div>
          <div className="flex flex-col"><label>Features (Comma separated):</label><input type="text" id="features" placeholder="AC, Sleeper, WiFi" onChange={handleChange} className="p-2 border rounded bg-gray-200 text-gray-800 outline-none" /></div>
          <div className="flex flex-col"><label>Upload Images:</label><input type="file" multiple accept="image/*" onChange={handleFile} className="p-2 bg-white text-black rounded" /></div>
          <button type="submit" disabled={loading} className="p-3 rounded bg-black text-white font-bold hover:opacity-90 mt-2">{loading ? "Saving..." : "List Transport"}</button>
        </form>
      </div>
    </div>
  );
};
export default AddTransport;