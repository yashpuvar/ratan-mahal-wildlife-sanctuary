const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
const windows = new Map();
const visitorUploadRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = req.ip;
  const window = windows.get(key);
  if (!window || now - window.started > 60 * 60 * 1000) windows.set(key, { started: now, count: 1 });
  else if (window.count >= 5) return res.status(429).json({ success: false, message: "Upload limit reached. Please try again later." });
  else window.count += 1;
  next();
};

const validatePhotoContent = (req, res, next) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: "A photo file is required" });
  const b = file.buffer;
  let extension = "";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) extension = ".jpg";
  else if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) extension = ".png";
  else if (b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") extension = ".webp";
  if (!extension || !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    return res.status(400).json({ success: false, message: "Only valid JPG, PNG and WebP images are accepted" });
  }
  req.safePhotoExtension = extension;
  next();
};

const uploadErrorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "Photo must be 5 MB or smaller" : "Invalid photo upload";
    return res.status(400).json({ success: false, message });
  }
  next(error);
};

module.exports = { upload, validatePhotoContent, visitorUploadRateLimit, uploadErrorHandler };
