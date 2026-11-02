const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const VisitorPhoto = require("../models/VisitorPhoto");

const uploadDirectory = path.join(__dirname, "..", "uploads", "visitor-photos");
const publicFields = "displayName title description location image status createdAt";
const getImageFilePath = async (photo) => path.join(uploadDirectory, path.basename(photo.filename));

const sendApprovedPhotoImage = async (req, res) => {
  try {
    const photo = await VisitorPhoto.findOne({ storageKey: req.params.id, status: "approved" }).select("image storageKey +filename").lean();
    if (!photo) return res.status(404).end();
    res.sendFile(await getImageFilePath(photo));
  } catch (error) { console.error("Public visitor image lookup failed:", error.message); res.status(404).end(); }
};

const sendAdminPhotoImage = async (req, res) => {
  try {
    const photo = await VisitorPhoto.findOne({ _id: req.params.id, status: "pending" }).select("image storageKey +filename").lean();
    if (!photo) return res.status(404).end();
    res.sendFile(await getImageFilePath(photo));
  } catch (error) { console.error("Admin visitor image lookup failed:", error.message); res.status(404).end(); }
};

const createVisitorPhoto = async (req, res) => {
  try {
    const { displayName, title, description = "", location = "", consent } = req.body || {};
    if (consent !== "true" || typeof displayName !== "string" || !displayName.trim() || displayName.length > 80 || typeof title !== "string" || !title.trim() || title.length > 120 || typeof description !== "string" || description.length > 500 || typeof location !== "string" || location.length > 120) {
      return res.status(400).json({ success: false, message: "Please provide valid photo details and consent" });
    }
    await fs.mkdir(uploadDirectory, { recursive: true });
    const filename = `${crypto.randomUUID()}${req.safePhotoExtension}`;
    await fs.writeFile(path.join(uploadDirectory, filename), req.file.buffer, { flag: "wx" });
    const storageKey = filename.slice(0, -req.safePhotoExtension.length);
    const photo = await VisitorPhoto.create({ displayName: displayName.trim(), title: title.trim(), description: description.trim(), location: location.trim(), image: `/api/gallery/visitor/image/${storageKey}`, storageKey, filename, status: "pending" });
    res.status(201).json({ success: true, message: "Photo submitted for Admin approval", data: photo });
  } catch (error) {
    console.error("Visitor photo upload failed:", error.message);
    res.status(500).json({ success: false, message: "Could not submit photo" });
  }
};

const listPendingVisitorPhotos = async (req, res) => {
  try {
    const photos = await VisitorPhoto.find({ status: "pending" }).select(publicFields).sort({ createdAt: 1 }).lean();
    res.json({ success: true, count: photos.length, data: photos });
  } catch (error) { console.error("Pending visitor photo lookup failed:", error.message); res.status(500).json({ success: false, message: "Could not load visitor photos" }); }
};

const moderateVisitorPhoto = async (req, res) => {
  const { status } = req.body || {};
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ success: false, message: "Choose approve or reject" });
  try {
    const photo = await VisitorPhoto.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true }).select(publicFields);
    if (!photo) return res.status(404).json({ success: false, message: "Visitor photo not found" });
    res.json({ success: true, message: `Photo ${status}`, data: photo });
  } catch (error) { console.error("Visitor photo moderation failed:", error.message); res.status(500).json({ success: false, message: "Could not update visitor photo" }); }
};

const deleteVisitorPhoto = async (req, res) => {
  try {
    const photo = await VisitorPhoto.findByIdAndDelete(req.params.id).select("+filename");
    if (!photo) return res.status(404).json({ success: false, message: "Visitor photo not found" });
    const filename = path.basename(photo.filename);
    await fs.unlink(path.join(uploadDirectory, filename)).catch((error) => { if (error.code !== "ENOENT") throw error; });
    res.json({ success: true, message: "Visitor photo deleted" });
  } catch (error) { console.error("Visitor photo deletion failed:", error.message); res.status(500).json({ success: false, message: "Could not delete visitor photo" }); }
};

module.exports = { createVisitorPhoto, listPendingVisitorPhotos, moderateVisitorPhoto, deleteVisitorPhoto, sendApprovedPhotoImage, sendAdminPhotoImage };
