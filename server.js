const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./db");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:5000",
  "http://localhost:5000",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    return next();
  } catch (error) {
    return next(new Error("Invalid socket token"));
  }
});

const onlineUsers = new Set();

io.on("connection", (socket) => {
  socket.join(socket.userId);
  onlineUsers.add(socket.userId);
  io.emit("chat:online-users", [...onlineUsers]);

  socket.on("chat:typing", ({ receiverId, isTyping }) => {
    if (!receiverId) return;

    io.to(receiverId.toString()).emit("chat:typing", {
      userId: socket.userId,
      isTyping: Boolean(isTyping),
    });
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    io.emit("chat:online-users", [...onlineUsers]);
  });
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "MindMitra API is running" });
});

app.use("/api/auth", require("./authRoutes"));
app.use("/api/posts", require("./postRoutes"));
app.use("/api/chats", require("./chatRoutes"));
app.use("/api/profile", require("./profileRoutes"));
app.use("/api/moods", require("./moodRoutes"));
app.use("/api/admin", require("./adminRoutes"));
app.use("/api/help", require("./helpRoutes"));

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



