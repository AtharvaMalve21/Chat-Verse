const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendVerificationOTP } = require("../utils/sendVerificationOTP.js");
const dotenv = require("dotenv");
dotenv.config();

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    //send verification otp
    await sendVerificationOTP(email);

    return res.status(201).json({
      success: true,
      data:newUser,
      message:
        "Account Verification OTP is sent to your registered email address.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while signing up. Please try again later.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Both email and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please check your email.",
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    //check whether user account is verified
    if (!existingUser.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your account.",
      });
    }

    const token = jwt.sign({ _id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    };

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      data: existingUser,
      message: "Login successful. Welcome back!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while logging in. Please try again later.",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. User not found.",
      });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    };

    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logout successful. See you soon!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while logging out. Please try again later.",
    });
  }
};

exports.verifyAccount = async (req, res) => {
  try {
    //fetch the details
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email address or OTP is required.",
      });
    }

    //find the user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not registered with this email address.",
      });
    }

    //validate the otp
    if (user.verifyOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Try again.",
      });
    }

    if (user.verifyOTPExpiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired.",
      });
    }

    user.isAccountVerified = true;
    user.verifyOTP = undefined;
    user.verifyOTPExpiresAt = undefined;
    await user.save();

    //generate a token

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    };

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      data: user,
      message: "Your account has been successfully verified.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
