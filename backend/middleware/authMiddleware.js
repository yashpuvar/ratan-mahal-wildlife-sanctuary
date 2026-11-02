const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: "Authentication is not configured" });
  }

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "ratan-mahal-api",
      audience: "ratan-mahal-client",
    });
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const requireUser = (req, res, next) => {
  verifyToken(req, res, async () => {
    if (req.auth.role !== "user") {
      return res.status(403).json({ success: false, message: "User access required" });
    }
    try {
      const user = await User.findById(req.auth.id).select("name email picture");
      if (!user) return res.status(401).json({ success: false, message: "User account no longer exists" });
      req.user = user;
      next();
    } catch {
      res.status(500).json({ success: false, message: "Could not verify user account" });
    }
  });
};

const requireAdmin = (req, res, next) => {
  verifyToken(req, res, async () => {
    if (req.auth.role !== "admin") {
      return res.status(403).json({ success: false, message: "Administrator access required" });
    }
    try {
      const admin = await Admin.findById(req.auth.id).select("name email");
      if (!admin) return res.status(401).json({ success: false, message: "Admin account no longer exists" });
      req.admin = admin;
      next();
    } catch {
      res.status(500).json({ success: false, message: "Could not verify administrator account" });
    }
  });
};

module.exports = { requireUser, requireAdmin };
