import React, { useState } from "react";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import { toast } from "react-toastify"; // Added professional toast notifications

const Contact = () => {
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    
    // Prevent empty submissions
    if (!formData.user_name || !formData.user_email || !formData.message) {
      return toast.error("Please fill out all fields.");
    }

    setLoading(true);

    emailjs
      .send(
        "service_t7sng6h",
        "template_0558q8s",
        formData,
        "oJc2CZ716CGc5FbjT"
      )
      .then(
        () => {
          setLoading(false);
          toast.success("Message sent successfully! We will get back to you soon.");
          setFormData({ user_name: "", user_email: "", message: "" });
        },
        (error) => {
          setLoading(false);
          console.error("FAILED...", error);
          toast.error("Failed to send message. Please try again later.");
        }
      );
  };

  return (
    <div className="bg-[#EB662B] py-16 px-4 text-white rounded-md">
      <motion.div
        className="max-w-4xl mx-auto bg-white text-gray-900 rounded-2xl shadow-xl p-8 md:p-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-[#EB662B]">
          Contact Us
        </h2>
        <p className="text-center mb-8">
          We'd love to hear from you! Fill out the form below and we'll get back
          to you shortly.
        </p>
        <form onSubmit={sendEmail} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Your Name</label>
            <input
              type="text"
              name="user_name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6358DC] transition"
              placeholder="Enter your name"
              value={formData.user_name}
              onChange={(e) =>
                setFormData({ ...formData, user_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Your Email</label>
            <input
              type="email"
              name="user_email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6358DC] transition"
              placeholder="Enter your email"
              value={formData.user_email}
              onChange={(e) =>
                setFormData({ ...formData, user_email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">
              Your Message
            </label>
            <textarea
              name="message"
              rows="5"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6358DC] transition resize-none"
              placeholder="Enter your message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            ></textarea>
          </div>
          <div className="text-center">
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.95 }}
              className={`text-white font-semibold px-8 py-3 rounded-lg shadow-md transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#EB662B] hover:bg-[#d55923]"
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Contact;