const express = require("express");

const { loginAdmin, changeInitialPassword } = require("../controllers/adminAuthController");

const router = express.Router();
const { requireAdminIdentity } = require("../middleware/authMiddleware");

// Admin login
router.post("/login", loginAdmin);
router.get("/me", requireAdminIdentity, (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ success: true, admin: { id: req.admin._id, name: req.admin.name, email: req.admin.email, role: "admin", mustChangePassword: Boolean(req.admin.mustChangePassword) } });
});
router.post("/change-password", requireAdminIdentity, changeInitialPassword);

module.exports = router;
