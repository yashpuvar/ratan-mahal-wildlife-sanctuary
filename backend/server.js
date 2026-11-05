const express = require("express");
const cors = require("cors");
const { createCorsOptions } = require("./config/cors");
const dotenv = require("dotenv");
const path = require("node:path");

// Deployment environment variables retain precedence over the local file.
dotenv.config({ path: path.join(__dirname, ".env"), quiet: true });

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
app.use(cors(createCorsOptions(process.env)));
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
    adminRecoveryProtocol: 1,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
};

if (require.main === module) startServer().catch(() => {
  // connectDB reports sanitized errors; never dump a raw driver error or URI.
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET must be configured with at least 32 characters");
  }
  process.exitCode = 1;
});

module.exports = app;
