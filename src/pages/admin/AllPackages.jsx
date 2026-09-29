import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";
const BACKEND_IMAGES = "https://travelease-backend-mwq0.onrender.com/images/";
const PAGE_SIZE = 8;

// CRASH PROOF PARSER
const getImgUrl = (data) => {
  let path = data?.packageImages || data?.images || data;
  if (Array.isArray(path)) path = path[0];
  if (path && typeof path === "object" && path.url) path = path.url;
  if (!path || typeof path !== "string" || path === "null") return FALLBACK_IMG;
  return path.startsWith("http") ? path : `${BACKEND_IMAGES}${path}`;
};

const AllPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showMoreBtn, setShowMoreBtn] = useState(false);

  const buildUrl = (startIndex = 0) => {
    const sortQuery =
      filter === "offer"
        ? "&offer=true"
        : filter === "latest"
        ? "&sort=createdAt"
        : filter === "top"
        ? "&sort=packageRating"
        : "";
    // ask for one extra item so we know whether a "Load More" button is needed
    return `/api/package/get-packages?searchTerm=${encodeURIComponent(
      search
    )}${sortQuery}&limit=${PAGE_SIZE + 1}&startIndex=${startIndex}`;
  };

  const getPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildUrl(0));
      const data = await res.json();
      if (data?.success) {
        setPackages(data.packages.slice(0, PAGE_SIZE));
        setShowMoreBtn(data.packages.length > PAGE_SIZE);
      } else {
        toast.error(data?.message || "Could not load packages");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onShowMoreClick = async () => {
    try {
      const res = await fetch(buildUrl(packages.length));
      const data = await res.json();
      if (data?.success) {
        setPackages([...packages, ...data.packages.slice(0, PAGE_SIZE)]);
        setShowMoreBtn(data.packages.length > PAGE_SIZE);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search]);

  const handleDelete = async (packageId) => {
    if (!window.confirm("Delete this package permanently?")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/package/delete-package/${packageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(data?.message || "Package deleted");
        getPackages();
      } else {
        toast.error(data?.message || "Could not delete package");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <input
        className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#EB662B]"
        type="text"
        placeholder="Search Packages..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex gap-2 border-b pb-4">
        {["all", "offer", "latest", "top"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-bold capitalize transition ${
              filter === f
                ? "bg-[#EB662B] text-white"
                : "bg-white border text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && packages.length === 0 && (
        <p className="text-center text-gray-500">Loading...</p>
      )}
      {!loading && packages.length === 0 && (
        <p className="text-center text-gray-500">No packages found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pack) => (
          <div
            key={pack._id}
            className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col"
          >
            <Link to={`/package/${pack._id}`}>
              <img
                src={getImgUrl(pack.packageImages)}
                alt="Package"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMG;
                }}
                className="w-full h-48 object-cover hover:scale-105 transition duration-300"
              />
            </Link>
            <div className="p-4 flex flex-col gap-2">
              <Link to={`/package/${pack._id}`}>
                <h3 className="font-bold text-lg text-gray-900 hover:text-[#EB662B]">
                  {pack.packageName}
                </h3>
              </Link>
              <p className="text-gray-500 text-sm">📍 {pack.packageDestination}</p>
              <p className="font-black text-[#EB662B] text-xl mt-2">৳ {pack.packagePrice}</p>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Link
                  to={`/profile/admin/update-package/${pack._id}`}
                  className="flex-1 text-center bg-gray-100 text-gray-800 py-2 rounded font-bold hover:bg-gray-200"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(pack._id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded font-bold hover:bg-red-600 hover:text-white transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showMoreBtn && (
        <button
          onClick={onShowMoreClick}
          className="mx-auto mt-4 px-8 py-3 bg-[#6358DC] text-white font-bold rounded-lg hover:opacity-90"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default AllPackages;