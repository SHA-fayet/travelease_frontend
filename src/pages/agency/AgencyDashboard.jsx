import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logOutStart, logOutSuccess, logOutFailure } from "../../redux/user/userSlice";
import { toast } from "react-toastify";
import { FaBuilding, FaBoxOpen, FaMoneyBillWave, FaSignOutAlt, FaPlusCircle, FaClipboardList, FaHotel, FaBus, FaMapMarkedAlt } from "react-icons/fa";

const AgencyDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("packages");
  const [agencyPackages, setAgencyPackages] = useState([]);
  const [agencyHotels, setAgencyHotels] = useState([]);
  const [agencyTransports, setAgencyTransports] = useState([]);
  const [agencyGuides, setAgencyGuides] = useState([]);
  const [agencyBookings, setAgencyBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.user_role !== 2) {
      navigate("/login");
      return;
    }
    fetchAgencyData();
  }, [currentUser]);

  const fetchAgencyData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Packages
      const pkgRes = await fetch(`/api/package/get-packages?agencyId=${currentUser._id}`, { credentials: "include" });
      const pkgData = await pkgRes.json();
      if (pkgData.success) setAgencyPackages(pkgData.packages);

      // 2. Fetch Standalone Services (Hotels, Transport, Guides)
      const hotelRes = await fetch(`/api/services/hotel/list?agencyId=${currentUser._id}`);
      const hotelData = await hotelRes.json();
      if (hotelData.success) setAgencyHotels(hotelData.data);

      const transRes = await fetch(`/api/services/transportation/list?agencyId=${currentUser._id}`);
      const transData = await transRes.json();
      if (transData.success) setAgencyTransports(transData.data);

      const guideRes = await fetch(`/api/services/guide/list?agencyId=${currentUser._id}`);
      const guideData = await guideRes.json();
      if (guideData.success) setAgencyGuides(guideData.data);

      // 3. Fetch Bookings
      const bookRes = await fetch(`/api/booking/get-agency-bookings`, { credentials: "include" });
      const bookData = await bookRes.json();
      if (bookData.success && Array.isArray(bookData.bookings)) setAgencyBookings(bookData.bookings);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch("/api/auth/logout", { credentials: "include" });
      const data = await res.json();
      if (!data?.success) return dispatch(logOutFailure(data?.message));
      dispatch(logOutSuccess());
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) { console.error(error); }
  };

  if (!currentUser || currentUser.user_role !== 2) return null;

  const totalRevenue = agencyBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const totalListings = agencyPackages.length + agencyHotels.length + agencyTransports.length + agencyGuides.length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 text-white p-2.5 rounded-xl text-xl font-black">
            <FaBuilding />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">{currentUser.agencyName || currentUser.username}</h1>
            <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">Verified Partner Agency Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-sm font-bold text-gray-600 hover:text-teal-600 transition">
            Home
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition flex items-center gap-2"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl text-2xl"><FaBoxOpen /></div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase">Total Active Listings</p>
              <h3 className="text-2xl font-black text-gray-900">{totalListings}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl text-2xl"><FaClipboardList /></div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase">Total Bookings</p>
              <h3 className="text-2xl font-black text-gray-900">{agencyBookings.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-2xl"><FaMoneyBillWave /></div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase">Total Revenue</p>
              <h3 className="text-2xl font-black text-emerald-600">৳ {totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col">
          <div className="flex border-b bg-gray-50 px-6 pt-4 gap-6 overflow-x-auto">
            {["packages", "hotels", "transportation", "guides", "bookings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-bold text-sm border-b-2 transition whitespace-nowrap capitalize ${
                  activeTab === tab ? "border-teal-600 text-teal-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "bookings" ? "Customer Bookings & Reports" : tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "packages" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 text-lg">Tour Packages</h3>
                  <button onClick={() => navigate("/admin/add-package")} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    <FaPlusCircle /> Create Package
                  </button>
                </div>
                {loading ? <p>Loading...</p> : agencyPackages.length === 0 ? <p className="text-gray-400">No packages found.</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {agencyPackages.map((pkg) => (
                      <div key={pkg._id} className="border rounded-xl p-4 bg-white shadow-sm flex flex-col h-full justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">{pkg.packageName}</h4>
                          <p className="text-xs text-gray-500 mt-1">📍 {pkg.destination || pkg.packageDestination}</p>
                          <p className="text-sm font-black text-teal-600 mt-2">৳ {pkg.packagePrice}</p>
                        </div>
                        <div className="flex gap-2 border-t pt-3 mt-3">
                          <button onClick={() => navigate(`/package/${pkg._id}`)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition">
                            View
                          </button>
                          <button onClick={() => navigate(`/admin/update-package/${pkg._id}`)} className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-teal-700 transition">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "hotels" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 text-lg">Independent Hotels</h3>
                  <button onClick={() => navigate("/admin/add-hotel")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    <FaHotel /> Add Hotel
                  </button>
                </div>
                {agencyHotels.length === 0 ? <p className="text-gray-400">No hotels listed yet.</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {agencyHotels.map(h => (
                      <div key={h._id} className="border rounded-xl p-4 bg-white shadow-sm flex flex-col h-full justify-between">
                        <div>
                          <h4 className="font-bold">{h.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">📍 {h.location}</p>
                          <p className="text-sm font-black text-blue-600 mt-2">৳ {h.pricePerNight} / night</p>
                        </div>
                        <div className="flex gap-2 border-t pt-3 mt-3">
                          <button onClick={() => navigate(`/admin/update-hotel/${h._id}`)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "transportation" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 text-lg">Transportation Services</h3>
                  <button onClick={() => navigate("/admin/add-transport")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    <FaBus /> Add Transport
                  </button>
                </div>
                {agencyTransports.length === 0 ? <p className="text-gray-400">No transport services listed yet.</p> : (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {agencyTransports.map(t => (
                     <div key={t._id} className="border rounded-xl p-4 bg-white shadow-sm flex flex-col h-full justify-between">
                       <div>
                         <h4 className="font-bold">{t.operatorName} - {t.vehicleType}</h4>
                         <p className="text-xs text-gray-500 mt-1">{t.departureLocation} → {t.arrivalLocation}</p>
                         <p className="text-sm font-black text-indigo-600 mt-2">৳ {t.price}</p>
                       </div>
                       <div className="flex gap-2 border-t pt-3 mt-3">
                          <button onClick={() => navigate(`/admin/update-transport/${t._id}`)} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">
                            Edit
                          </button>
                        </div>
                     </div>
                   ))}
                 </div>
                )}
              </div>
            )}

            {activeTab === "guides" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 text-lg">Local Guides</h3>
                  <button onClick={() => navigate("/admin/add-guide")} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    <FaMapMarkedAlt /> Add Guide
                  </button>
                </div>
                {agencyGuides.length === 0 ? <p className="text-gray-400">No guides listed yet.</p> : (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {agencyGuides.map(g => (
                     <div key={g._id} className="border rounded-xl p-4 bg-white shadow-sm flex flex-col h-full justify-between">
                       <div>
                         <h4 className="font-bold">{g.name}</h4>
                         <p className="text-xs text-gray-500 mt-1">📍 {g.location} ({g.expertise})</p>
                         <p className="text-sm font-black text-orange-600 mt-2">৳ {g.pricePerDay} / day</p>
                       </div>
                       <div className="flex gap-2 border-t pt-3 mt-3">
                          <button onClick={() => navigate(`/admin/update-guide/${g._id}`)} className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-orange-700 transition">
                            Edit
                          </button>
                        </div>
                     </div>
                   ))}
                 </div>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-gray-800 text-lg">Customer Bookings & Financial Reports</h3>
                {agencyBookings.length === 0 ? (
                  <p className="text-center py-10 text-gray-400">No bookings recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                          <th className="p-3">Booking ID</th>
                          <th className="p-3">Travel Date</th>
                          <th className="p-3">Travelers</th>
                          <th className="p-3">Total Amount</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {agencyBookings.map((b) => (
                          <tr key={b._id} className="hover:bg-gray-50">
                            <td className="p-3 font-mono text-xs">{b._id.slice(-8).toUpperCase()}</td>
                            <td className="p-3 font-medium">{new Date(b.date || b.travelDate).toLocaleDateString()}</td>
                            <td className="p-3">{b.persons || b.travelersCount || 1}</td>
                            <td className="p-3 font-bold text-emerald-600">৳ {b.totalPrice}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">
                                {b.status || "Confirmed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgencyDashboard;