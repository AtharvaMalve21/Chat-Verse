import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../context/UserContext.jsx";

const VerifyAccount = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const URI = import.meta.env.VITE_BACKEND_URI;
  const navigate = useNavigate();

  const { setIsLoggedIn, user } = useContext(UserContext);

  const handleChange = (value, index) => {
    if (!isNaN(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];
    pastedData.forEach((char, idx) => {
      if (!isNaN(char) && idx < 6) {
        newOtp[idx] = char;
      }
    });
    setOtp(newOtp);
    setTimeout(() => {
      const filledLength = pastedData.length;
      if (filledLength < 6) inputRefs.current[filledLength]?.focus();
    }, 10);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length !== 6) return toast.error("Enter 6-digit OTP");

    try {
      const { data } = await axios.post(
        URI + "/api/v1/auth/verify-account",
        { email: user.email, otp: code },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (data.success) {
        setIsLoggedIn(true);
        toast.success(data.message);
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1e2e] to-[#2d2d44] px-4 py-12">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-gray-700 text-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 tracking-wide">
          Verify Your Account
        </h2>

        <form onSubmit={handleVerify}>
          <div
            className="flex justify-center gap-3 mb-6"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-12 h-12 text-xl text-center bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 text-white rounded-md text-sm font-medium tracking-wide transition"
          >
            Verify Account
          </button>

          <p className="text-center text-sm text-gray-300 mt-4">
            Didn’t receive the code?{" "}
            <button
              type="button"
              className="text-violet-400 hover:underline transition"
              onClick={() => toast("Resend OTP feature coming soon!")}
            >
              Resend OTP
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;
