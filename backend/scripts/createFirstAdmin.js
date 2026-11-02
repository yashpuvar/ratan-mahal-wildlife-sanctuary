const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const connectDB = require("../config/db");

dotenv.config({ path: require("node:path").join(__dirname, "..", ".env"), quiet: true });

const fail = (message) => { throw new Error(message); };

async function createFirstAdmin() {
  if (!process.env.MONGODB_URI) fail("MONGODB_URI must be configured in the backend environment");
  await connectDB();

  const existingCount = await Admin.countDocuments();
  if (existingCount > 0) {
    console.log("An administrator account already exists. No changes were made; first-admin setup is disabled.");
    return;
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Set ADMIN_EMAIL to a valid email address in backend/.env");
  if (!password || password.length < 12) fail("Set ADMIN_PASSWORD to a unique password of at least 12 characters in backend/.env");

  const setupLocks = mongoose.connection.collection("admin_setup_locks");
  try {
    await setupLocks.insertOne({ _id: "first-admin", createdAt: new Date() });
  } catch (error) {
    if (error.code === 11000) fail("First-admin setup has already been claimed. No account was changed.");
    throw error;
  }

  try {
    if (await Admin.countDocuments() > 0) {
      console.log("An administrator account already exists. No changes were made; first-admin setup is disabled.");
      return;
    }
    await Admin.create({ name: "Ratan Mahal Admin", email, password });
    console.log("The first administrator account was created. Password stored as a bcrypt hash.");
  } catch (error) {
    await setupLocks.deleteOne({ _id: "first-admin" });
    if (error.code === 11000) fail("An administrator account already exists. No changes were made.");
    throw error;
  }
}

createFirstAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
