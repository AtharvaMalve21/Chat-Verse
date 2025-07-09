const Message = require("../models/message.model");
const User = require("../models/user.model");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

exports.addMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Sender not found.",
      });
    }

    const { id: receiverId } = req.params;
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found. Please check the recipient ID.",
      });
    }

    const { message } = req.body;
    let imageUrl = null;

    // Upload image if exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "Chat-Verse/Messages",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // remove local file
    }

    if ((!message || !message.trim()) && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Message content or image is required.",
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself.",
      });
    }

    // Create message first
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message?.trim() || "",
      image: imageUrl,
    });

    // Populate sender and receiver fields
    const populatedMessage = await Message.findById(newMessage._id)
      .populate({
        path: "sender",
        select: "name email additionalDetails",
        populate: {
          path: "additionalDetails",
          model: "Profile",
        },
      })
      .populate({
        path: "receiver",
        select: "name email additionalDetails",
        populate: {
          path: "additionalDetails",
          model: "Profile",
        },
      });

    return res.status(201).json({
      success: true,
      data: populatedMessage,
      message: "Message sent successfully.",
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const senderId = req.user._id;
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Sender not found.",
      });
    }

    const { id: receiverId } = req.params;
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found.",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
      .populate({
        path: "sender",
        select: "name email additionalDetails",
        populate: {
          path: "additionalDetails",
          model: "Profile", // or whatever your Profile model is called
        },
      })
      .populate({
        path: "receiver",
        select: "name email additionalDetails",
        populate: {
          path: "additionalDetails",
          model: "Profile",
        },
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: messages,
      message: "Messages fetched successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages. Please try again later.",
    });
  }
};

//in my case only the sender ---authenticate user can delete his/her messages
exports.deleteMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Sender not found.",
      });
    }

    const { id: messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or already deleted.",
      });
    }

    if (message.sender.toString() !== senderId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only delete your own messages.",
      });
    }

    await message.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete message. Please try again later.",
    });
  }
};
