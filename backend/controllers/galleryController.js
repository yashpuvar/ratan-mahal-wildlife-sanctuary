const Gallery = require("../models/Gallery");
const VisitorPhoto = require("../models/VisitorPhoto");

// GET: All published gallery photos
const getGalleryImages = async (req, res) => {
  try {
    const [galleryImages, visitorImages] = await Promise.all([Gallery.find({ isPublished: true }).sort({
      createdAt: -1,
    }).lean(), VisitorPhoto.find({ status: "approved" }).select("title image description location displayName storageKey createdAt").sort({ createdAt: -1 }).lean()]);
    const images = [
      ...galleryImages,
      ...visitorImages.map((item) => ({ ...item, category: "Visitor Moments", credit: item.displayName, source: item.image, license: "Visitor submission" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch gallery images",
      error: error.message,
    });
  }
};

// POST: Add a gallery photo
const createGalleryImage = async (req, res) => {
  try {
    const { title, image, category, description } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: "Title and image URL are required",
      });
    }

    const newImage = await Gallery.create({
      title,
      image,
      category,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Gallery photo added successfully",
      data: newImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not add gallery photo",
      error: error.message,
    });
  }
};

// DELETE: Delete gallery photo by ID
const deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Gallery photo not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery photo deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not delete gallery photo",
      error: error.message,
    });
  }
};

module.exports = {
  getGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
};
