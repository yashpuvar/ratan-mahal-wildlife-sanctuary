const express = require("express");
const { requireAdmin } = require("../middleware/authMiddleware");
const {
  getPublicStatus,
  getPublicHours,
  getAdminSettings,
  saveSettings,
  saveOverride,
} = require("../controllers/sanctuaryController");

const router = express.Router();
const { streamSanctuaryChanges } = require("../services/sanctuaryEvents");

router.get("/events", streamSanctuaryChanges);
router.get("/status", getPublicStatus);
router.get("/hours", getPublicHours);
router.get("/admin/settings", requireAdmin, getAdminSettings);
router.put("/admin/settings", requireAdmin, saveSettings);
router.put("/admin/override", requireAdmin, saveOverride);
router.get("/hotel-status", async (req, res) => {
  try {
    const SanctuarySettings = require("../models/SanctuarySettings");
    const settings = await SanctuarySettings.findById("sanctuary").select("hotelOpen").lean();
    res.json({ success: true, data: { open: settings?.hotelOpen === true } });
  } catch (error) {
    console.error("Hotel status lookup failed:", error.message);
    res.status(503).json({ success: false, message: "Hotel status is temporarily unavailable" });
  }
});
router.put("/admin/hotel-status", requireAdmin, async (req, res) => {
  if (typeof req.body?.open !== "boolean") return res.status(400).json({ success: false, message: "Choose OPEN or TEMPORARILY CLOSED" });
  try {
    const SanctuarySettings = require("../models/SanctuarySettings");
    const settings = await SanctuarySettings.findByIdAndUpdate("sanctuary", { $set: { hotelOpen: req.body.open } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ success: true, message: "Hotel status saved", data: { open: settings.hotelOpen } });
  } catch (error) {
    console.error("Hotel status save failed:", error.message);
    res.status(500).json({ success: false, message: "Could not save hotel status" });
  }
});

module.exports = router;
