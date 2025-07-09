import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { Link, useNavigate } from "react-router-dom"
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserContext } from "../context/UserContext.jsx";


const Signup = () => {

  const { setUser, setIsLoggedIn } = useContext(UserContext);

  const [userData, setUserData] = useState(
    {
      name: '',
      email: '',
      password: ''
    }
  );

  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev)
  }


  const changeHandler = (ev) => {
    let { name, value } = ev.target;

    setUserData((prevData) => (
      {
        ...prevData,
        [name]: value
      }
    ))
  }

  const URI = import.meta.env.VITE_BACKEND_URI;

  const navigate = useNavigate();

  const signupHandler = async (ev) => {

    ev.preventDefault();

    try {

      const { data } = await axios.post(URI + "/api/v1/auth/signup", userData, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      });

      if (data.success) {
        setUser(data.data);
        setIsLoggedIn(true);
        toast.success(data.message);
        navigate("/");
      }

    } catch (err) {
      toast.error(err.response.data.message);
    }

  }

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col sm:flex-row items-center justify-center gap-36 px-6 py-12 backdrop-blur-2xl">

      {/* Left - Logo */}
      <div className="flex-shrink-0">
        <img src={assets.logo_big} className="w-[min(30vw,220px)]" alt="Logo" />
      </div>

      {/* Right - Signup Form */}
      <div className="flex flex-col items-center gap-8">
        <form onSubmit={signupHandler} className="bg-white/10 backdrop-blur-lg border border-gray-600 text-white p-10 rounded-2xl w-[420px] flex flex-col gap-6 shadow-2xl">

          <h2 className="text-3xl font-bold text-center text-white tracking-wide">
            Get Started
          </h2>

          {/* Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={changeHandler}
              placeholder="Full Name"
              className="pl-10 p-3 w-full rounded-md bg-transparent border border-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={changeHandler}
              placeholder="Email Address"
              className="pl-10 p-3 w-full rounded-md bg-transparent border border-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={userData.password}
              onChange={changeHandler}
              placeholder="Password"
              className="pl-10 pr-10 p-3 w-full rounded-md bg-transparent border border-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
            <span
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300"
            >
              {showPassword ? (
                <AiOutlineEye className="w-5 h-5" />
              ) : (
                <AiOutlineEyeInvisible className="w-5 h-5" />
              )}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 rounded-md text-white text-sm font-medium tracking-wide transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-white text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline text-violet-400 hover:text-violet-300 transition">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup
