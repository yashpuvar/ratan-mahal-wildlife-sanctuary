const Post = require("../models/Post");


// GET: All published posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isPublished: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch posts",
      error: error.message,
    });
  }
};

// GET: Single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch post",
      error: error.message,
    });
  }
};

// POST: Create new post
const createPost = async (req, res) => {
  try {
    const { title, description, category, image, author } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const newPost = await Post.create({
      title,
      description,
      category,
      image,
      author,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not create post",
      error: error.message,
    });
  }
};

// DELETE: Delete a post by ID
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not delete post",
      error: error.message,
    });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  deletePost,
};
