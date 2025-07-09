const express = require("express");
const router = express.Router();

const { signup, login, logout } = require("../controllers/auth.controller.js");

const { isAuthenticated } = require("../middleware/auth.middleware.js");

//Signup Route
router.post("/signup", signup);

//Login Route
router.post("/login", login);

//Logout Route
router.get("/logout", isAuthenticated, logout);

module.exports = router;
