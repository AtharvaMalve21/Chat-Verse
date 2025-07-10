const User = require("../models/user.model");
const transporter = require("./nodemailer");
const dotenv = require("dotenv");
const { accountVerificationTemplate } = require("./emailTemplate");
dotenv.config();

exports.sendVerificationOTP = async (email) => {
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exists with this email address",
      });
    }

    const otp = await user.generateVerificationOTP();

    return await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Account Verification OTP",
      html: accountVerificationTemplate(user.name, otp),
    });
  } catch (err) {
    console.log(err.message);
  }
};
