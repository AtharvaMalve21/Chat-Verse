const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db.js");
const connectToCloudinary = require("./config/cloudinary.js");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");
const messageRoutes = require("./routes/message.routes.js");

const User = require("./models/user.model.js"); // ✅ Needed for fetching sender

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URI,
    credentials: true,
  },
});
const PORT = process.env.PORT || 5050;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(cors({ origin: process.env.CLIENT_URI, credentials: true }));

// Connect to DB & Cloudinary
connectDB();
connectToCloudinary();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/message", messageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Chat Verse!" });
});

// ============================
// 💬 Socket.io Real-Time Logic
// ============================
const onlineUsers = new Map(); // userId => socketId

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // User joins their own room
  socket.on("join", (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} joined room`);

    // Notify others
    socket.broadcast.emit("user-online", userId);
  });

  // ✅ Real-time messaging with full sender data
  socket.on(
    "send-message",
    async ({ senderId, receiverId, message, image = null, createdAt }) => {
      try {
        if (!senderId || !receiverId || (!message && !image)) return;

        // ✅ Get full sender details with profile
        const sender = await User.findById(senderId)
          .select("name email additionalDetails")
          .populate({
            path: "additionalDetails",
            model: "Profile",
          });

        if (!sender) return;

        const msg = {
          sender,
          receiver: { _id: receiverId },
          message: message?.trim() || "",
          image,
          createdAt: createdAt || new Date(),
        };

        // Emit to receiver and sender
        io.to(receiverId).emit("receive-message", msg);
        io.to(senderId).emit("message-sent", msg);
      } catch (err) {
        console.error("WebSocket send-message error:", err.message);
      }
    }
  );

  // Typing Indicator
  socket.on("typing", ({ receiverId }) => {
    io.to(receiverId).emit("typing", { from: socket.id });
  });

  socket.on("stop-typing", ({ receiverId }) => {
    io.to(receiverId).emit("stop-typing", { from: socket.id });
  });

  // Disconnect & Cleanup
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);

    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        socket.broadcast.emit("user-offline", userId);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
