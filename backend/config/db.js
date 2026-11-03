const mongoose = require("mongoose");

const validateMongoUri = (uri) => {
  if (!uri) throw new Error("MONGODB_URI is required. Check backend/.env or the deployment environment.");
  if (uri !== uri.trim() || !/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error("MONGODB_URI must start with mongodb:// or mongodb+srv:// and have no surrounding whitespace.");
  }
  if (/<[^>]*>/.test(uri)) {
    throw new Error("MONGODB_URI contains an unfilled connection-string placeholder.");
  }
  try {
    // Use the installed driver's parser, including standard multi-host URIs.
    new mongoose.mongo.MongoClient(uri);
  } catch {
    throw new Error("MONGODB_URI is malformed. Check its structure and percent-encode username/password components exactly once.");
  }
};

const connectionErrorMessage = (error) => {
  if (error.code === 18 || error.code === 8000 || /authentication failed|bad auth/i.test(error.message || "")) {
    return "MongoDB authentication failed. In Atlas Database Access, verify the database username and password for the target cluster/project (not your Atlas login). Encode credential components exactly once and check authSource against the Atlas connection string. Existing environment variables take precedence over backend/.env.";
  }
  if (error.name === "MongoParseError") {
    return "MongoDB URI could not be parsed. Check connection options and credential encoding in MONGODB_URI.";
  }
  return "MongoDB connection failed. Check Atlas cluster availability, DNS/network access, the IP access list, and TLS settings. Connection details have been omitted to protect credentials.";
};

// Preserve an explicitly selected URI database, but never silently use Atlas's "test" default.
const resolveDatabaseName = (uri, override) => {
  if (override?.trim()) return override.trim();
  const databasePath = uri.split("?")[0].replace(/^mongodb(?:\+srv)?:\/\/[^/]+/, "");
  return databasePath && databasePath !== "/" ? undefined : "RatanMahal";
};

const connectDB = async () => {
  try {
    validateMongoUri(process.env.MONGODB_URI);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
  try {
    // An explicit database avoids Atlas URIs without a path silently using "test".
    // Keep URI-selected databases unchanged unless an override is configured.
    const dbName = resolveDatabaseName(process.env.MONGODB_URI, process.env.MONGODB_DB_NAME);
    await mongoose.connect(process.env.MONGODB_URI, dbName ? { dbName } : {});

    console.log(`MongoDB connected successfully (database: ${mongoose.connection.name})`);
  } catch (error) {
    const message = connectionErrorMessage(error);
    console.error(message);
    throw new Error(message);
  }
};

module.exports = connectDB;
module.exports.validateMongoUri = validateMongoUri;
module.exports.connectionErrorMessage = connectionErrorMessage;

module.exports.resolveDatabaseName = resolveDatabaseName;
