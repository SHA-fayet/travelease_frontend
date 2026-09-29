import React, { useEffect, useState } from "react";
import "./styles/Home.css";
import { FaCalendar, FaStar } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { LuBadgePercent } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import Services from "./components/Services";
import Top from "./components/Top";
import HeroImage from "./components/HeroImage";
import Offers from "./components/Offers";
import SingleCard from "./components/SingleCard";
import AIPromoBanner from "./components/AIPromoBanner";

const Home = () => {
  const navigate = useNavigate();
  const [topPackages, setTopPackages] = useState([]);
  const [latestPackages, setLatestPackages] = useState([]);
  const [offerPackages, setOfferPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadHomepagePackages = async () => {
      setLoading(true);
      try {
        const [topRes, latestRes, offerRes] = await Promise.all([
          fetch("/api/package/get-packages?sort=packageRating&order=desc&limit=8"),
          fetch("/api/package/get-packages?sort=createdAt&order=desc&limit=8"),
          fetch("/api/package/get-packages?sort=createdAt&order=desc&offer=true&limit=8"),
        ]);

        const topData = await topRes.json();
        const latestData = await latestRes.json();
        const offerData = await offerRes.json();

        setTopPackages(topData?.packages || []);
        setLatestPackages(latestData?.packages || []);
        setOfferPackages(offerData?.packages || []);
      } catch (error) {
        console.error("Failed to load homepage packages:", error);
      } finally {
        setLoading(false);
      }
    };
    loadHomepagePackages();
  }, []);

  const handleSearch = () => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return navigate("/search");
    navigate(`/search?searchTerm=${encodeURIComponent(trimmedSearch)}`);
  };

  return (
    <div className="main w-full">
      <HeroImage />
      <Services />
      <Top />
      <AIPromoBanner />

      <div className="w-full flex flex-col my-10 px-4 md:px-8">
        <div className="w-full bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 md:p-12 text-white shadow-xl flex flex-col items-center text-center gap-6">
          <div className="max-w-2xl flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-yellow-400">Discover Bangladesh Your Way</h2>
            <p className="text-gray-200 text-sm md:text-base">Explore local destinations, compare travel packages, discover special offers, and plan your next Bangladesh adventure with TravelEase.</p>
          </div>

          <div className="w-full max-w-xl flex items-center bg-white rounded-full p-1.5 shadow-lg">
            <input type="text" className="flex-1 px-4 py-2 outline-none text-gray-800 bg-transparent placeholder:text-gray-400 text-sm md:text-base" placeholder="Search Bangladesh destinations or packages..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            <button type="button" onClick={handleSearch} className="bg-[#EB662B] text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-95 transition text-sm md:text-base shadow">Go</button>
          </div>

          <div className="w-full max-w-2xl flex flex-wrap justify-center gap-2 mt-2">
            <button type="button" onClick={() => navigate("/search?offer=true")} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition"><LuBadgePercent className="text-yellow-400" /> Special Offers</button>
            <button type="button" onClick={() => navigate("/search?sort=packageRating")} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition"><FaStar className="text-yellow-400" /> Top Rated</button>
            <button type="button" onClick={() => navigate("/search?sort=createdAt")} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition"><FaCalendar /> Latest</button>
          </div>
        </div>

        <div className="main py-10 flex flex-col gap-10">
          {loading && <h2 className="text-center text-xl py-6">Loading Bangladesh packages...</h2>}

          {!loading && topPackages.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Top Bangladesh Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {topPackages.map((pkg) => <SingleCard key={pkg?._id} packageData={pkg} />)}
              </div>
            </div>
          )}

          {!loading && latestPackages.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Latest Bangladesh Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {latestPackages.map((pkg) => <SingleCard key={pkg?._id} packageData={pkg} />)}
              </div>
            </div>
          )}

          {!loading && offerPackages.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Special Offers in Bangladesh</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {offerPackages.map((pkg) => <Offers key={pkg?._id} packageData={pkg} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Home;