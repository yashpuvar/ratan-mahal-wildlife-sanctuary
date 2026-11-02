const express = require("express");
const router = express.Router();

const { googleLogin } = require("../controllers/googleAuthController");
const { requireUser } = require("../middleware/authMiddleware");

router.post("/login", googleLogin);
router.get("/me", requireUser, (req, res) => {
  res.json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email, picture: req.user.picture, role: "user" } });
});

module.exports = router;
