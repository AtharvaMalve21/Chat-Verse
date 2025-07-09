const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer.middleware.js");

const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getChatUsers,
  searchUser,
} = require("../controllers/user.controller.js");

const { isAuthenticated } = require("../middleware/auth.middleware.js");

router.get("/profile", isAuthenticated, getUserProfile);
router.put(
  "/edit-profile",
  upload.single("profileImage"),
  isAuthenticated,
  updateUserProfile
);
router.delete("/profile", isAuthenticated, deleteUserProfile);

router.get("/", isAuthenticated, getChatUsers);

router.get("/search-user", isAuthenticated, searchUser);

module.exports = router;
