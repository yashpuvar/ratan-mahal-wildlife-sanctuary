const mongoose = require("mongoose");

const visitorPhotoSchema = new mongoose.Schema({
  displayName: { type: String, required: true, trim: true, maxlength: 80 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  location: { type: String, trim: true, maxlength: 120, default: "" },
  image: { type: String, required: true },
  storageKey: { type: String, required: true, unique: true, select: false },
  filename: { type: String, required: true, select: false },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
}, { timestamps: true });

module.exports = mongoose.model("VisitorPhoto", visitorPhotoSchema);
