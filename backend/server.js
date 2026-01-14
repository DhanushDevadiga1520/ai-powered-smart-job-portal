const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose  
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully ✅");
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed ❌", error);
  });


app.use("/api/auth", authRoutes);

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You accessed a protected route ✅",
    user: req.user,
  });
});

app.use("/api/jobs", jobRoutes);

app.use("/api/applications", applicationRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("AI Job Portal Backend + MongoDB Connected 🚀");
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});