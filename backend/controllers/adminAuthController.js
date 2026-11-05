const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// JWT token generate function
const generateToken = (admin) => {
  const restricted = Boolean(admin.mustChangePassword);
  return jwt.sign({ id: admin._id, role: "admin", credentialVersion: admin.passwordVersion || 0,
    ...(restricted ? { purpose: "admin-password-change" } : {}) }, process.env.JWT_SECRET, {
    expiresIn: restricted ? "15m" : "7d",
    algorithm: "HS256",
    issuer: "ratan-mahal-api",
    audience: "ratan-mahal-client",
  });
};

const adminIdentity = admin => ({ id: admin._id, name: admin.name, email: admin.email, role: "admin", mustChangePassword: Boolean(admin.mustChangePassword) });
const temporaryExpired = admin => admin.mustChangePassword && (!admin.temporaryPasswordExpiresAt || new Date(admin.temporaryPasswordExpiresAt).getTime() <= Date.now());

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({ email: String(email).trim().toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatched = await admin.matchPassword(password);

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (temporaryExpired(admin)) {
      return res.status(401).json({ success: false, message: "Temporary credentials expired; owner recovery assistance is required" });
    }

    res.set?.("Cache-Control", "no-store");
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(admin),
      mustChangePassword: Boolean(admin.mustChangePassword),
      admin: adminIdentity(admin),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not login",
      error: undefined,
    });
  }
};

const changeInitialPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 12 || Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({ success: false, message: "Use a new password of at least 12 characters and at most 72 UTF-8 bytes" });
    }
    const admin = await Admin.findById(req.admin._id);
    if (!admin || !admin.mustChangePassword || temporaryExpired(admin) || (admin.passwordVersion || 0) !== (req.auth.credentialVersion || 0)) {
      return res.status(401).json({ success: false, message: "Password-change session is no longer valid" });
    }
    if (!await admin.matchPassword(currentPassword)) return res.status(401).json({ success: false, message: "Current password is incorrect" });
    if (await admin.matchPassword(newPassword)) return res.status(400).json({ success: false, message: "Choose a different password from the temporary password" });
    admin.password = newPassword;
    admin.mustChangePassword = false;
    admin.temporaryPasswordExpiresAt = null;
    admin.passwordVersion = (admin.passwordVersion || 0) + 1;
    // Existing pre-save bcrypt hook; optimistic concurrency rejects competing changes.
    await admin.save();
    res.set?.("Cache-Control", "no-store");
    return res.status(200).json({ success: true, token: generateToken(admin), admin: adminIdentity(admin), mustChangePassword: false });
  } catch {
    return res.status(500).json({ success: false, message: "Could not complete password change; sign in again to check account status" });
  }
};

module.exports = { loginAdmin, changeInitialPassword };
