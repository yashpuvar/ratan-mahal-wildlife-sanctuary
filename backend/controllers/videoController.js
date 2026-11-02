const Video = require("../models/Video");

// GET: All published videos
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isPublished: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch videos",
      error: error.message,
    });
  }
};

// POST: Add new video
const createVideo = async (req, res) => {
  try {
    const { title, youtubeId, thumbnail, category, description, duration } =
      req.body;

    if (!title || !youtubeId) {
      return res.status(400).json({
        success: false,
        message: "Video title and YouTube video ID are required",
      });
    }

    const newVideo = await Video.create({
      title,
      youtubeId,
      thumbnail,
      category,
      description,
      duration,
    });

    res.status(201).json({
      success: true,
      message: "Video added successfully",
      data: newVideo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not add video",
      error: error.message,
    });
  }
};

// DELETE: Delete video by MongoDB ID
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not delete video",
      error: error.message,
    });
  }
};

module.exports = {
  getVideos,
  createVideo,
  deleteVideo,
};
