import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultProfileImg from "../../assets/images/profile.png";

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return defaultProfileImg;
  const timestamp = new Date().getTime(); 
  if (avatarPath.startsWith("http")) return `${avatarPath}?t=${timestamp}`;
  return `http://localhost:8000/images/${avatarPath}?t=${timestamp}`;
};

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const activeLink = location.pathname;
  const linkClass = (path) =>
    `hover:underline hover:scale-105 transition-all duration-150 ${
      activeLink === path ? "underline text-[#EB662B]" : ""
    }`;

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
        <div className="bg-white max-w-7xl w-full mx-auto p-4 text-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Link to="/">
                <h1 className="text-4xl font-bold text-[#EB662B]">TravelEase</h1>
              </Link>
            </div>
            <div className="hidden md:flex justify-center flex-1">
              <ul className="flex items-center gap-6 text-lg font-medium">
                <li className={linkClass("/")}><Link to="/">Home</Link></li>
                <li className={linkClass("/search")}><Link to="/search">Bookings</Link></li>
                {/* NEW SERVICES LINK */}
                <li className={linkClass("/services")}><Link to="/services">Services</Link></li>
                <li className={linkClass("/about")}><Link to="/about">About</Link></li>
                <li className={linkClass("/contact")}><Link to="/contact">Contact</Link></li>
                <li className={linkClass("/blog")}><Link to="/blog">Blog</Link></li>
              </ul>
            </div>
            <div className="flex-1 flex justify-end items-center">
              {currentUser ? (
                <Link to={`/profile/${currentUser.user_role === 1 ? "admin" : "user"}`}>
                  <img
                    src={getAvatarUrl(currentUser?.avatar)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultProfileImg;
                    }}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 shadow-sm hover:border-[#EB662B] transition"
                  />
                </Link>
              ) : (
                <Link className="bg-[#EB662B] hover:opacity-90 transition text-white px-8 py-2 rounded-full font-semibold" to="/login">
                  Login
                </Link>
              )}
              <button className="text-3xl ml-4 md:hidden text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
                ☰
              </button>
            </div>
          </div>
          {menuOpen && (
            <ul className="flex flex-col gap-4 mt-4 text-lg md:hidden border-t pt-4">
              <li className={linkClass("/")}><Link onClick={() => setMenuOpen(false)} to="/">Home</Link></li>
              <li className={linkClass("/search")}><Link onClick={() => setMenuOpen(false)} to="/search">Bookings</Link></li>
              {/* NEW SERVICES LINK (MOBILE) */}
              <li className={linkClass("/services")}><Link onClick={() => setMenuOpen(false)} to="/services">Services</Link></li>
              <li className={linkClass("/about")}><Link onClick={() => setMenuOpen(false)} to="/about">About</Link></li>
              <li className={linkClass("/contact")}><Link onClick={() => setMenuOpen(false)} to="/contact">Contact</Link></li>
              <li className={linkClass("/blog")}><Link onClick={() => setMenuOpen(false)} to="/blog">Blog</Link></li>
              <li>
                {currentUser ? (
                  <Link onClick={() => setMenuOpen(false)} to={`/profile/${currentUser.user_role === 1 ? "admin" : "user"}`}>
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                      <img src={getAvatarUrl(currentUser?.avatar)} onError={(e) => { e.target.onerror = null; e.target.src = defaultProfileImg; }} alt="avatar" className="w-10 h-10 object-cover border border-gray-200 rounded-full" />
                      <span className="font-semibold text-gray-700">My Profile</span>
                    </div>
                  </Link>
                ) : (
                  <Link onClick={() => setMenuOpen(false)} to="/login" className={linkClass("/login")}>Login</Link>
                )}
              </li>
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;