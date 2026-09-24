import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AddPackages = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "",
    packageTransportation: "",
    packageMeals: "",
    packageActivities: "",
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageImages: [],
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [id]: type === "checkbox" ? checked : value 
    });
  };

  const handleFile = (e) => {
    const files = e.target.files;
    setFormData((prevData) => ({
      ...prevData,
      packageImages: Array.from(files),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.packageImages.length === 0) {
      toast.error("You must upload at least 1 image");
      return;
    }

    if (
      formData.packageName === "" ||
      formData.packageDescription === "" ||
      formData.packageDestination === "" ||
      formData.packageAccommodation === "" ||
      formData.packageTransportation === "" ||
      formData.packageMeals === "" ||
      formData.packageActivities === "" ||
      formData.packagePrice === 0
    ) {
      toast.error("All fields are required!");
      return;
    }

    if (formData.packagePrice < 500) {
      toast.error("Price should be greater than 500!");
      return;
    }

    if (
      formData.packageOffer &&
      formData.packageDiscountPrice >= formData.packagePrice
    ) {
      toast.error("Regular Price should be greater than Discount Price!");
      return;
    }

    const data = new FormData();
    data.append("packageName", formData.packageName);
    data.append("packageDescription", formData.packageDescription);
    data.append("packageDestination", formData.packageDestination);
    data.append("packageAccommodation", formData.packageAccommodation);
    data.append("packageTransportation", formData.packageTransportation);
    data.append("packageMeals", formData.packageMeals);
    data.append("packageActivities", formData.packageActivities);
    data.append("packagePrice", formData.packagePrice);
    data.append("packageDiscountPrice", formData.packageDiscountPrice);
    data.append("packageOffer", formData.packageOffer);
    data.append("packageDays", formData.packageDays);
    data.append("packageNights", formData.packageNights);
    data.append("agencyId", currentUser?._id || "");

    if (Array.isArray(formData.packageImages)) {
      formData.packageImages.forEach((image) => {
        data.append("packageImages", image);
      });
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/package/create-package`, {
        method: "POST",
        credentials: "include", // CRITICAL: Ensures auth cookies are sent with native fetch
        body: data,
      });

      const result = await res.json();
      if (!result.success) {
        setError(result.message || "Something went wrong");
        setLoading(false);
        toast.error(result.message || "Failed to create package");
        return;
      }

      toast.success(result.message || "Package created successfully!");
      setLoading(false);
      setError(false);
      
      setFormData({
        packageName: "",
        packageDescription: "",
        packageDestination: "",
        packageDays: 1,
        packageNights: 1,
        packageAccommodation: "",
        packageTransportation: "",
        packageMeals: "",
        packageActivities: "",
        packagePrice: 500,
        packageDiscountPrice: 0,
        packageOffer: false,
        packageImages: [],
      });

      // Redirect based on role (Agency vs Admin)
      if (currentUser?.user_role === 2) {
        navigate("/agency-dashboard");
      } else {
        navigate("/profile/admin");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setLoading(false);
      setError("Something went wrong. Try again!");
      toast.error("Network error during package creation.");
    }
  };

  return (
    <div className="mt-6 w-full min-h-screen flex items-center justify-center bg-[#EB662B] text-white rounded-lg py-10">
      <div className="w-[95%] md:w-[90%] lg:w-[80%] mx-auto flex flex-col gap-6 rounded-xl shadow-xl py-8 px-4">
        <h1 className="text-center text-lg font-semibold md:text-3xl md:font-bold text-white">
          Add <span className="">Package</span>
        </h1>

        <div className="flex flex-col md:flex-row gap-5 items-center justify-center">
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col">
              <label>Name:</label>
              <input
                type="text"
                id="packageName"
                value={formData.packageName}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label>Description:</label>
              <textarea
                id="packageDescription"
                value={formData.packageDescription}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none resize-none"
              />
            </div>

            <div className="flex flex-col">
              <label>Destination:</label>
              <input
                type="text"
                id="packageDestination"
                value={formData.packageDestination}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col w-full">
                <label>Days:</label>
                <input
                  type="number"
                  id="packageDays"
                  value={formData.packageDays}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
                />
              </div>
              <div className="flex flex-col w-full">
                <label>Nights:</label>
                <input
                  type="number"
                  id="packageNights"
                  value={formData.packageNights}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label>Accommodation:</label>
              <textarea
                id="packageAccommodation"
                value={formData.packageAccommodation}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none resize-none"
              />
            </div>

            <div className="flex flex-col">
              <label>Transportation:</label>
              <select
                id="packageTransportation"
                value={formData.packageTransportation}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
              >
                <option value="">Select</option>
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Boat">Boat</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label>Meals:</label>
              <textarea
                id="packageMeals"
                value={formData.packageMeals}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none resize-none"
              />
            </div>

            <div className="flex flex-col">
              <label>Activities:</label>
              <textarea
                id="packageActivities"
                value={formData.packageActivities}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none resize-none"
              />
            </div>

            <div className="flex flex-col">
              <label>Price:</label>
              <input
                type="number"
                id="packagePrice"
                value={formData.packagePrice}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="packageOffer">Offer:</label>
              <input
                type="checkbox"
                id="packageOffer"
                checked={formData.packageOffer}
                onChange={handleChange}
                className="w-4 h-4"
              />
            </div>

            {formData.packageOffer && (
              <div className="flex flex-col">
                <label>Discount Price:</label>
                <input
                  type="number"
                  id="packageDiscountPrice"
                  value={formData.packageDiscountPrice}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2">Upload Images</label>
              <div className="relative flex items-center justify-center w-full cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-gray-500">Click to select images</span>
              </div>

              {formData.packageImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {formData.packageImages.map((file, index) => {
                    const imageUrl = URL.createObjectURL(file);
                    return (
                      <div
                        key={index}
                        className="relative w-full aspect-square border border-gray-300 rounded overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || loading}
              className="text-white p-3 rounded bg-black hover:opacity-95 disabled:opacity-70 mt-2 font-bold shadow"
            >
              {uploading ? "Uploading..." : loading ? "Loading..." : "Create New Package"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPackages;