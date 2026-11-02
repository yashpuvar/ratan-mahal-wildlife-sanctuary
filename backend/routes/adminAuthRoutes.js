const express = require("express");

const { loginAdmin } = require("../controllers/adminAuthController");

const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");

// Admin login
router.post("/login", loginAdmin);
router.get("/me", requireAdmin, (req, res) => {
  res.json({ success: true, admin: { id: req.admin._id, name: req.admin.name, email: req.admin.email, role: "admin" } });
});

module.exports = router;
