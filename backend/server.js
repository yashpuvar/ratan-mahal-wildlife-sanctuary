const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const postRoutes = require("./routes/postRoutes");
const contactRoutes = require("./routes/contactRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const videoRoutes = require("./routes/videoRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const sanctuaryRoutes = require("./routes/sanctuaryRoutes");
const visitorPhotoRoutes = require("./routes/visitorPhotoRoutes");

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// API Routes
app.use("/api/posts", postRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/auth/google", googleAuthRoutes);
app.use("/api/sanctuary", sanctuaryRoutes);
app.use("/api/gallery/visitor", visitorPhotoRoutes);



// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ratan Mahal Wildlife Sanctuary API is running 🐻",
  });
});

// Health route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server and database connection are healthy",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
};

startServer();
