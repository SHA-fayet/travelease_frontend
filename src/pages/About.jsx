import React from "react";
import { motion } from "framer-motion";
import { FaMapMarkedAlt, FaCalendarCheck, FaHeadset } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import about from "../assets/images/about.jpg";

const features = [
  {
    icon: FaMapMarkedAlt,
    title: "Discover Bangladesh",
    text: "Find destinations, experiences, and curated tour packages in one place.",
  },
  {
    icon: FaCalendarCheck,
    title: "Plan & Book",
    text: "Compare packages, choose your travel dates, and manage your booking journey easily.",
  },
  {
    icon: FaHeadset,
    title: "Travel Support",
    text: "Get helpful guidance throughout your planning and booking experience.",
  },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <main className="w-full bg-white">
      <section className="w-full bg-white py-12 md:py-16 px-4 md:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
            <motion.div
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
            >
              <img
                src={about}
                alt="TravelEase Bangladesh travel experience"
                className="w-full h-[320px] md:h-[460px] rounded-2xl shadow-xl object-cover"
              />
            </motion.div>

            <motion.div
              className="w-full lg:w-1/2 text-center lg:text-left"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block bg-orange-50 text-[#EB662B] px-4 py-2 rounded-full text-sm font-bold mb-4">
                About TravelEase
              </span>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-[#05073C]">
                Your journey across Bangladesh, <span className="text-[#EB662B]">made easier.</span>
              </h1>

              <p className="mt-5 text-gray-700 text-base md:text-lg leading-relaxed">
                TravelEase brings travel discovery, curated tour packages, planning, and booking together in one convenient platform. Whether you are looking for beaches, hills, forests, lakes, or cultural destinations, our goal is to make your next journey easier to discover and simpler to organize.
              </p>

              <p className="mt-4 text-gray-600 leading-relaxed">
                We are building TravelEase around the needs of modern travelers in Bangladesh, with a focus on reliable travel information, clear package pricing, smooth booking, and useful travel support.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={() => navigate("/search")}
                  className="px-6 py-3 bg-[#EB662B] text-white rounded-lg font-semibold hover:bg-orange-700 transition-all duration-300"
                >
                  Explore Tours
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/search?offer=true")}
                  className="px-6 py-3 border border-[#EB662B] text-[#EB662B] rounded-lg font-semibold hover:bg-orange-50 transition-all duration-300"
                >
                  View Special Offers
                </button>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14 md:mt-16">
            {features.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#EB662B] flex items-center justify-center text-xl">
                  <Icon />
                </div>
                <h2 className="mt-4 text-xl font-bold text-[#05073C]">{title}</h2>
                <p className="mt-2 text-gray-600 leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
