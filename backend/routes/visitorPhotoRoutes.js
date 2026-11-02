const express = require("express");
const { requireUser, requireAdmin } = require("../middleware/authMiddleware");
const { upload, validatePhotoContent, visitorUploadRateLimit, uploadErrorHandler } = require("../middleware/visitorPhotoUpload");
const { createVisitorPhoto, listPendingVisitorPhotos, moderateVisitorPhoto, deleteVisitorPhoto, sendApprovedPhotoImage, sendAdminPhotoImage } = require("../controllers/visitorPhotoController");

const router = express.Router();
router.post("/", requireUser, visitorUploadRateLimit, upload.single("photo"), validatePhotoContent, createVisitorPhoto, uploadErrorHandler);
router.get("/image/:id", sendApprovedPhotoImage);
router.get("/admin/pending", requireAdmin, listPendingVisitorPhotos);
router.get("/admin/:id/image", requireAdmin, sendAdminPhotoImage);
router.patch("/admin/:id/status", requireAdmin, moderateVisitorPhoto);
router.delete("/admin/:id", requireAdmin, deleteVisitorPhoto);
module.exports = router;
