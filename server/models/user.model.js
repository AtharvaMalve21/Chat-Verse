const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    additionalDetails: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    verifyOTP: {
      type: String,
    },
    verifyOTPExpiresAt: {
      type: Date,
    },
    resetPassword: {
      type: String,
    },
    resetPasswordExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateVerificationOTP = async function () {
  const otp = crypto.randomInt(100000, 999999).toString();
  this.verifyOTP = otp;
  this.verifyOTPExpiresAt = Date.now() + 15 * 60 * 1000; //15 minutes
  await this.save();
  return otp;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
