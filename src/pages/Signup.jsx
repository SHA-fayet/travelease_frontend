import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import loginImage from "../assets/images/login.png";
import { toast } from "react-toastify";
import { FaBuilding, FaIdCard } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    user_role: 0, // 0 = Regular User, 2 = Travel Agency
    agencyName: "",
    businessLicense: "",
  });
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength("Weak");
    } else if (
      password.length >= 6 &&
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)
    ) {
      setPasswordStrength("Medium");
    } else if (
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$\%^&*]{8,}$/.test(
        password
      )
    ) {
      setPasswordStrength("Strong");
    } else {
      setPasswordStrength("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 11) {
      toast.error("Phone number must be 11 digits long.");
      return;
    }
    try {
      const res = await axios.post(`/api/auth/signup`, formData);
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        navigate("/login");
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="w-full mx-auto min-h-screen flex justify-center items-center bg-[#FFF1DA] py-10">
      <div className="w-[90%] bg-white md:w-[65%] mx-auto flex flex-col rounded-md shadow-xl p-6 gap-6">
        <h1 className="text-center text-lg mt-2 font-medium md:text-3xl md:font-bold text-gray-800">
          Signup into <span className="text-[#FF7D68]">TravelEase</span>
        </h1>

        {/* Account Type Selector Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-lg max-w-md mx-auto w-full">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, user_role: 0 })}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition ${formData.user_role === 0 ? "bg-white text-[#EB662B] shadow-sm" : "text-gray-500"}`}
          >
            Traveler Account
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, user_role: 2 })}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition ${formData.user_role === 2 ? "bg-white text-[#6358DC] shadow-sm" : "text-gray-500"}`}
          >
            Partner Agency
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          <div className="w-full md:w-1/2 flex justify-center">
            <img src={loginImage} alt="Login" className="max-h-[300px]" />
          </div>

          <form onSubmit={handleSubmit} className="w-full md:w-1/2 px-2 flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-md bg-gray-50 outline-none text-sm"
                placeholder="Your Username"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-md bg-gray-50 outline-none text-sm"
                placeholder="Your Email"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-md bg-gray-50 outline-none text-sm"
                placeholder="Your Password"
                required
              />
              {passwordStrength && (
                <p
                  className={`mt-1 text-xs font-semibold ${
                    passwordStrength === "Weak"
                      ? "text-red-500"
                      : passwordStrength === "Medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {passwordStrength} Password
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded-md bg-gray-50 outline-none text-sm resize-none h-16"
                placeholder="Your Address"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Phone (11 digits)</label>
              <input
                type="number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-md bg-gray-50 outline-none text-sm"
                placeholder="Your Phone Number"
                required
              />
            </div>

            {/* Conditional Agency Inputs */}
            {formData.user_role === 2 && (
              <div className="flex flex-col gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg mt-2">
                <h4 className="text-xs font-black text-[#6358DC] uppercase tracking-wider">Agency Details</h4>
                <div>
                  <label className="text-xs font-bold text-gray-700">Agency / Company Name</label>
                  <div className="flex items-center border bg-white rounded-md px-2 mt-1">
                    <FaBuilding className="text-gray-400 mr-2 text-xs" />
                    <input type="text" name="agencyName" placeholder="Global Tours Ltd" value={formData.agencyName} onChange={handleChange} required className="w-full p-2 bg-transparent outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700">Business License Number</label>
                  <div className="flex items-center border bg-white rounded-md px-2 mt-1">
                    <FaIdCard className="text-gray-400 mr-2 text-xs" />
                    <input type="text" name="businessLicense" placeholder="LIC-987654" value={formData.businessLicense} onChange={handleChange} required className="w-full p-2 bg-transparent outline-none text-sm" />
                  </div>
                </div>
              </div>
            )}

            <button className="w-full bg-[#EB662B] text-white p-3 mt-3 rounded-md font-bold shadow transition hover:opacity-90">
              Signup
            </button>
            <p className="my-2 text-center text-sm">
              Already have an account?{" "}
              <span className="text-[#EB662B] font-bold">
                <Link to="/login">Login</Link>
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;