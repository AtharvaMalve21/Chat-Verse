const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Please login again.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: "User profile retrieved successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile. Please try again later.",
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Please login again.",
      });
    }

    const { gender, contact, address, bio, profession } = req.body;
    const profileImage = req.file?.path;

    if (contact && !/^\d{10}$/.test(contact)) {
      return res.status(400).json({
        success: false,
        message: "Contact must be a valid 10-digit number.",
      });
    }

    let cloudinaryResponse;
    if (profileImage) {
      cloudinaryResponse = await cloudinary.uploader.upload(profileImage, {
        folder: "Chat-Verse/users",
      });
    }

    if (user.additionalDetails) {
      const profile = await Profile.findById(user.additionalDetails);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found.",
        });
      }

      profile.gender = gender || profile.gender;
      profile.contact = contact || profile.contact;
      profile.address = address || profile.address;
      profile.bio = bio || profile.bio;
      profile.profession = profession || profile.profession;
      profile.profileImage =
        cloudinaryResponse?.secure_url || profile.profileImage;

      await profile.save();

      return res.status(200).json({
        success: true,
        data: profile,
        message: "Profile updated successfully.",
      });
    } else {
      const newProfile = await Profile.create({
        gender,
        contact,
        address,
        bio,
        profession,
        profileImage: cloudinaryResponse?.secure_url || "",
      });

      user.additionalDetails = newProfile._id;
      await user.save();

      if (profileImage && fs.existsSync(profileImage)) {
        fs.unlinkSync(profileImage);
      }

      return res.status(201).json({
        success: true,
        data: newProfile,
        message: "Profile created successfully.",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile. Please try again later.",
    });
  }
};

exports.deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Please login again.",
      });
    }

    const profileId = user.additionalDetails;
    if (!profileId) {
      return res.status(404).json({
        success: false,
        message: "No profile found to delete.",
      });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    await profile.deleteOne();
    user.additionalDetails = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete profile. Please try again later.",
    });
  }
};

//chat users
exports.getChatUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Please login again.",
      });
    }

    const users = await User.find({ _id: { $ne: userId } })
      .select("-password")
      .populate("additionalDetails");

    return res.status(200).json({
      success: true,
      data: users,
      message: "Chat users fetched successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch chat users. Please try again later.",
    });
  }
};

// GET /search-user?name=atharva
exports.searchUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User authentication failed.",
      });
    }

    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const users = await User.find({
      _id: { $ne: userId },
      name: { $regex: name, $options: "i" },
    })
      .select("name")
      .populate("additionalDetails");

    return res.status(200).json({
      success: true,
      data: users,
      message: "Users fetched successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
