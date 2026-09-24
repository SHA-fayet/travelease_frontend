import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const getImgUrl = (images) => {
  if (!images || images.length === 0) return "https://via.placeholder.com/150";
  return images[0].startsWith("http") ? images[0] : `http://localhost:8000/images/${images[0]}`;
};

const AllPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showMoreBtn, setShowMoreBtn] = useState(false);

  const getPackages = async () => {
    try {
      setLoading(true);
      const sortQuery = filter === "offer" ? "&offer=true" : filter === "latest" ? "&sort=createdAt" : filter === "top" ? "&sort=packageRating" : "";
      const res = await fetch(`/api/package/get-packages?searchTerm=${search}${sortQuery}`);
      const data = await res.json();
      if (data?.success) { setPackages(data.packages); setShowMoreBtn(data.packages.length > 8); } 
      else { toast.error(data?.message); }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const onShowMoreClick = async () => {
    try {
      const sortQuery = filter === "offer" ? "&offer=true" : filter === "latest" ? "&sort=createdAt" : filter === "top" ? "&sort=packageRating" : "";
      const res = await fetch(`/api/package/get-packages?searchTerm=${search}${sortQuery}&startIndex=${packages.length}`);
      const data = await res.json();
      setPackages([...packages, ...data.packages]);
      setShowMoreBtn(data?.packages?.length >= 9);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { getPackages(); }, [filter, search]);

  const handleDelete = async (packageId) => {
    if(!window.confirm("Delete this package permanently?")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/package/delete-package/${packageId}`, { method: "DELETE" });
      const data = await res.json();
      toast.success(data?.message);
      getPackages();
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <input className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#EB662B]" type="text" placeholder="Search Packages..." value={search} onChange={(e) => setSearch(e.target.value)} />
      
      <div className="flex gap-2 border-b pb-4">
        {["all", "offer", "latest", "top"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full font-bold capitalize transition ${filter === f ? "bg-[#EB662B] text-white" : "bg-white border text-gray-600 hover:bg-gray-100"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pack) => (
          <div key={pack._id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            <Link to={`/package/${pack._id}`}>
              <img src={getImgUrl(pack.packageImages)} alt="Package" className="w-full h-48 object-cover hover:scale-105 transition duration-300" />
            </Link>
            <div className="p-4 flex flex-col gap-2">
              <Link to={`/package/${pack._id}`}><h3 className="font-bold text-lg text-gray-900 hover:text-[#EB662B]">{pack.packageName}</h3></Link>
              <p className="text-gray-500 text-sm">📍 {pack.packageDestination}</p>
              <p className="font-black text-[#EB662B] text-xl mt-2">৳ {pack.packagePrice}</p>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Link to={`/profile/admin/update-package/${pack._id}`} className="flex-1 text-center bg-gray-100 text-gray-800 py-2 rounded font-bold hover:bg-gray-200">Edit</Link>
                <button onClick={() => handleDelete(pack._id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded font-bold hover:bg-red-600 hover:text-white transition">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showMoreBtn && <button onClick={onShowMoreClick} className="mx-auto mt-4 px-8 py-3 bg-[#6358DC] text-white font-bold rounded-lg hover:opacity-90">Load More</button>}
    </div>
  );
};
export default AllPackages;