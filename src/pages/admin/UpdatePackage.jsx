import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";

// Works for: new File objects, full URLs, filenames, and {url} objects
const getImgUrl = (image) => {
  if (image instanceof File) return URL.createObjectURL(image);
  let path = image;
  if (path && typeof path === "object" && path.url) path = path.url;
  if (!path || typeof path !== "string" || path === "null") return FALLBACK_IMG;
  return path.startsWith("http")
    ? path
    : `https://travelease-backend-mwq0.onrender.com/images/${path}`;
};

const inputClass = "w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none";

const UpdatePackage = () => {
  const params = useParams();
  const navigate = useNavigate();
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getPackageData = async () => {
    try {
      const res = await fetch(`/api/package/get-package-data/${params?.id}`);
      const data = await res.json();
      if (data?.success) {
        const p = data.packageData || {};
        setFormData({
          packageName: p.packageName || "",
          packageDescription: p.packageDescription || "",
          packageDestination: p.packageDestination || "",
          packageDays: p.packageDays ?? 1,
          packageNights: p.packageNights ?? 1,
          packageAccommodation: p.packageAccommodation || "",
          packageTransportation: p.packageTransportation || "",
          packageMeals: p.packageMeals || "",
          packageActivities: p.packageActivities || "",
          packagePrice: p.packagePrice ?? 500,
          packageDiscountPrice: p.packageDiscountPrice ?? 0,
          packageOffer: !!p.packageOffer,
          packageImages: p.packageImages || [],
        });
      } else {
        toast.error(data?.message || "Something went wrong!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Could not load package data");
    }
  };

  useEffect(() => {
    if (params.id) getPackageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const handleFile = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + formData.packageImages.length > 10) {
      toast.error("You can only upload 10 images per package");
      e.target.value = "";
      return;
    }
    setFormData({ ...formData, packageImages: [...formData.packageImages, ...selectedFiles] });
    e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      packageImages: formData.packageImages.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.packageImages.length === 0) return toast.error("You must upload at least 1 image");
    if (
      !formData.packageName ||
      !formData.packageDescription ||
      !formData.packageDestination ||
      !formData.packageAccommodation ||
      !formData.packageTransportation ||
      !formData.packageMeals ||
      !formData.packageActivities ||
      !formData.packagePrice
    )
      return toast.error("All fields are required!");
    if (Number(formData.packagePrice) < 500) return toast.error("Price should be at least 500!");
    if (
      formData.packageOffer &&
      Number(formData.packageDiscountPrice) >= Number(formData.packagePrice)
    )
      return toast.error("Regular Price should be greater than Discount Price!");

    try {
      setLoading(true);
      setError(false);
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "packageImages") form.append(key, value);
      });
      // Existing images are sent as text (URLs), new images as files.
      // The backend merges them together.
      formData.packageImages.forEach((image) => {
        if (image instanceof File) {
          form.append("packageImages", image);
        } else {
          const value = typeof image === "string" ? image : image?.url;
          if (value) form.append("packageImages", value);
        }
      });

      const res = await fetch(`/api/package/update-package/${params?.id}`, {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const data = await res.json();
      if (data?.success === false) {
        setError(data?.message);
        toast.error(data?.message || "Update failed");
      } else {
        toast.success(data?.message || "Package updated successfully!");
        navigate(`/package/${params?.id}`);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Something went wrong!");
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="w-full flex flex-wrap justify-center gap-2 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:w-[60%] space-y-4 shadow-md rounded-xl p-4 bg-white"
      >
        <h1 className="text-center text-2xl font-semibold">Update Package</h1>

        <div>
          <label className="font-medium">Name</label>
          <input type="text" id="packageName" value={formData.packageName} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="font-medium">Description</label>
          <textarea id="packageDescription" value={formData.packageDescription} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="font-medium">Destination</label>
          <input type="text" id="packageDestination" value={formData.packageDestination} onChange={handleChange} className={inputClass} />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="font-medium">Days</label>
            <input type="number" id="packageDays" value={formData.packageDays} onChange={handleChange} className={inputClass} />
          </div>
          <div className="flex-1">
            <label className="font-medium">Nights</label>
            <input type="number" id="packageNights" value={formData.packageNights} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="font-medium">Accommodation</label>
          <textarea id="packageAccommodation" value={formData.packageAccommodation} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className="font-medium">Transportation</label>
          <select id="packageTransportation" value={formData.packageTransportation} onChange={handleChange} className={inputClass}>
            <option value="">Select</option>
            {/* keeps any existing custom value (e.g. "AC Bus / Local Transport") selectable */}
            {formData.packageTransportation &&
              !["Flight", "Train", "Boat", "Other"].includes(formData.packageTransportation) && (
                <option value={formData.packageTransportation}>{formData.packageTransportation}</option>
              )}
            <option value="Flight">Flight</option>
            <option value="Train">Train</option>
            <option value="Boat">Boat</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="font-medium">Meals</label>
          <textarea id="packageMeals" value={formData.packageMeals} onChange={handleChange} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="font-medium">Activities</label>
          <textarea id="packageActivities" value={formData.packageActivities} onChange={handleChange} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="font-medium">Price</label>
          <input type="number" id="packagePrice" value={formData.packagePrice} onChange={handleChange} className={inputClass} />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium" htmlFor="packageOffer">Offer</label>
          <input type="checkbox" id="packageOffer" checked={formData.packageOffer} onChange={handleChange} className="w-5 h-5" />
        </div>

        {formData.packageOffer && (
          <div>
            <label className="font-medium">Discount Price</label>
            <input type="number" id="packageDiscountPrice" value={formData.packageDiscountPrice} onChange={handleChange} className={inputClass} />
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-[#EB662B] text-white p-3 rounded-md hover:opacity-90 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update Package"}
        </button>
      </form>

      <div className="w-full sm:w-[30%] space-y-4 shadow-md rounded-xl p-4 bg-white h-max">
        <div>
          <label className="font-medium" htmlFor="packageImages">
            Images: <span className="text-red-700 text-sm block">(Max 10 images)</span>
          </label>
          <input
            type="file"
            id="packageImages"
            multiple
            accept="image/*"
            onChange={handleFile}
            className={inputClass}
          />
        </div>

        {formData.packageImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {formData.packageImages.map((image, i) => (
              <div key={i} className="relative shadow-sm rounded-md border p-1 flex justify-center items-center">
                <img
                  src={getImgUrl(image)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                  className="h-20 w-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-red-600 text-white text-xs w-5 h-5 rounded-full leading-5 text-center"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatePackage;