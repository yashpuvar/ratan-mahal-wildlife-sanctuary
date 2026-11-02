const express = require("express");

const {
  getVideos,
  createVideo,
  deleteVideo,
} = require("../controllers/videoController");

const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");

// GET all videos
// POST new video
router.route("/").get(getVideos).post(requireAdmin, createVideo);

// DELETE video by MongoDB ID
router.route("/:id").delete(requireAdmin, deleteVideo);

module.exports = router;
