const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// JWT token generate function
const generateToken = (adminId) => {
  return jwt.sign({ id: adminId, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
    issuer: "ratan-mahal-api",
    audience: "ratan-mahal-client",
  });
};

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

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(admin._id),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not login",
      error: undefined,
    });
  }
};

module.exports = { loginAdmin };
