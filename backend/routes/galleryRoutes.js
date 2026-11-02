const express = require("express");

const {
  getGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
} = require("../controllers/galleryController");

const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");

// GET all gallery images
// POST new gallery image
router.route("/").get(getGalleryImages).post(requireAdmin, createGalleryImage);

// DELETE gallery image by MongoDB ID
router.route("/:id").delete(requireAdmin, deleteGalleryImage);

module.exports = router;
