import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className=" max-w-7xl w-full mx-auto text-gray-800 py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          {/* FIX: was "Trevo" — leftover from a template, not this
              platform's actual name. */}
          <h2 className="text-2xl font-bold mb-4">TravelEase</h2>
          <p className="text-sm">
            Explore the world with comfort and confidence. TravelEase brings
            top travel experiences to your fingertips.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          {/* FIX: all four links pointed to "#" (nowhere). Wired to the
              actual routes used in Header.jsx. "Packages" -> /search since
              that's what Header.jsx's "Bookings" link and Home.jsx's
              "Book Now" buttons both point to for browsing packages. */}
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/search" className="hover:underline">
                Packages
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          {/* FIX: email/phone were placeholders and location was
              "Dubai, UAE" — a foreign leftover from a template, not this
              business's actual location. Replace the email/phone below
              with your real contact details; the Mirpur address is a
              reasonable local placeholder — swap in your exact office
              location if different. */}
          <p className="text-sm">Email: support@travelease.com</p>
          <p className="text-sm">Phone: +880 1XXX-XXXXXX</p>
          <p className="text-sm">Location: Mirpur-10, Dhaka, Bangladesh</p>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          {/* NOTE: these still point to "#" — I don't have your real
              social media URLs to fill in. Replace href="#" with your
              actual Facebook/Twitter/Instagram/LinkedIn page links. */}
          <div className="flex gap-4 text-xl">
            <a href="#" className="hover:text-gray-300">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-gray-300">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-gray-300">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-gray-300">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-sm border-t border-white/30 pt-4">
        © {new Date().getFullYear()} TravelEase. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;