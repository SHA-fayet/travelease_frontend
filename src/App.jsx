import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./pages/components/Header";
import Profile from "./pages/Profile";
import About from "./pages/About";
import PrivateRoute from "./pages/Routes/PrivateRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./pages/Routes/AdminRoute";
import UpdatePackage from "./pages/admin/UpdatePackage";
import AddPackages from "./pages/admin/AddPackages";
import AddHotel from "./pages/admin/AddHotel"; // <-- New
import AddTransport from "./pages/admin/AddTransport"; // <-- New
import AddGuide from "./pages/admin/AddGuide"; // <-- New
import Package from "./pages/Package";
import RatingsPage from "./pages/RatingsPage";
import Booking from "./pages/user/Booking";
import Search from "./pages/Search";
import AgencyDashboard from "./pages/agency/AgencyDashboard"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./pages/components/Footer";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import "leaflet/dist/leaflet.css";
import { FaRobot } from "react-icons/fa";
import AskAIModal from "./pages/components/AskAIModal"; 
import Services from "./pages/Services";
const App = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <BrowserRouter>
        <Header />
        <div className="max-w-7xl mx-auto py-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<Search />} />
            <Route path="/services" element={<Services />} />
            <Route path="/blog" element={<Blog />} />
            
            <Route path="/contact" element={<Contact />} />
            
            <Route path="/profile" element={<PrivateRoute />}>
              <Route path="user" element={<Profile />} />
            </Route>
            
            <Route path="/profile" element={<AdminRoute />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
            
            {/* Shared Management Routes (Accessible by Admins & Agencies) */}
            <Route path="/admin/add-package" element={<AddPackages />} />
            <Route path="/admin/add-packages" element={<AddPackages />} />
            <Route path="/admin/update-package/:id" element={<UpdatePackage />} />
            
            {/* New Standalone Service Routes */}
            <Route path="/admin/add-hotel" element={<AddHotel />} />
            <Route path="/admin/add-transport" element={<AddTransport />} />
            <Route path="/admin/add-guide" element={<AddGuide />} />

            <Route path="/agency-dashboard" element={<AgencyDashboard />} />
            
            <Route path="/about" element={<About />} />
            <Route path="/package/:id" element={<Package />} />
            <Route path="/package/ratings/:id" element={<RatingsPage />} />
            
            <Route path="/booking" element={<PrivateRoute />}>
              <Route path=":packageId" element={<Booking />} />
            </Route>
          </Routes>
        </div>
        <ToastContainer />
        <Footer />
      </BrowserRouter>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#EB662B] hover:bg-[#d55923] text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
      >
        <FaRobot size={28} />
        <span className="absolute right-16 bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Ask Travel Bhai
        </span>
      </button>

      <AskAIModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default App;