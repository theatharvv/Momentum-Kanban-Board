// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");

const mainRoutes = require("./routes/mainRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const boardRoutes = require("./routes/kanbanBoardRoutes");
const listRoutes = require("./routes/ListRoutes");
const cardRoutes = require("./routes/CardRoutes");
const uploadRoutes = require("./routes/UploadRoutes");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
connectDB();

// Serve static uploads at /uploads (ABSOLUTE PATH)
const uploadsDir = path.join(__dirname, "uploads");
console.log("Serving uploads from:", uploadsDir);
app.use("/uploads", express.static(uploadsDir)); // http://localhost:5000/uploads/<filename>

// API routes
app.use("/api/v1/auth", mainRoutes);
app.use("/api/v1/", dashboardRoutes);
app.use("/api/v1/", boardRoutes);
app.use("/api/v1/lists", listRoutes);
app.use("/api/v1/cards", cardRoutes);
app.use("/api/v1/", uploadRoutes);

// 404 fall-through (keep last)
app.use((req, res) => res.status(404).json({ msg: "Not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
