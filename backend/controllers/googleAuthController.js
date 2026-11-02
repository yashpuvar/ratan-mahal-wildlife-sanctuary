const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const googleLogin = async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) {
    return res.status(400).json({ success: false, message: "Google credential is required" });
  }
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: "Google authentication is not configured" });
  }

  let payload;
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch (error) {
    console.warn("Google credential verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Google authentication failed" });
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    return res.status(401).json({ success: false, message: "A verified Google email is required" });
  }

  try {
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      const email = payload.email.trim().toLowerCase();
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "This email is already linked to another sign-in method. Contact support to link accounts.",
        });
      }
      user = await User.create({
        name: payload.name || email,
        email,
        picture: payload.picture || "",
        googleId: payload.sub,
        role: "user",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d", algorithm: "HS256", issuer: "ratan-mahal-api", audience: "ratan-mahal-client" }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, picture: user.picture, role: "user" },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "This Google account or email is already registered" });
    }
    console.error("Google login could not be completed:", error.message);
    return res.status(500).json({ success: false, message: "Could not complete Google login" });
  }
};

module.exports = { googleLogin };
