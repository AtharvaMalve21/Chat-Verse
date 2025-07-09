const express = require("express");
const router = express.Router();

const {
  getMessages,
  deleteMessage,
  addMessage,
} = require("../controllers/message.controller");

const { isAuthenticated } = require("../middleware/auth.middleware");
const upload = require("../middleware/multer.middleware");


router.post("/:id", isAuthenticated, upload.single("image"), addMessage);
router.get("/:id", isAuthenticated, getMessages);
router.delete("/:id", isAuthenticated, deleteMessage);

module.exports = router;
