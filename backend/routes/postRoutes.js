const express = require("express");

const {
  getPosts,
  getPostById,
  createPost,
  deletePost,
} = require("../controllers/postController");

const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");

router.route("/").get(getPosts).post(requireAdmin, createPost);

router.route("/:id").get(getPostById).delete(requireAdmin, deletePost);

module.exports = router;
