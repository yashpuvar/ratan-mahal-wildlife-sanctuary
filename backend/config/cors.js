const PRODUCTION_ORIGIN = "https://ratan-mahal-wildlife-sanctuary-9fv5.vercel.app";

const normalizeOrigin = (value) => {
  const url = new URL(value.trim());
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password ||
      url.hostname.includes("*") || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("FRONTEND_ORIGIN entries must be HTTP(S) origins without paths or credentials");
  }
  return url.origin;
};

const createCorsOptions = (env = process.env) => {
  const origins = new Set([
    PRODUCTION_ORIGIN,
    ...(env.NODE_ENV === "production" ? [] : ["http://localhost:5173", "http://127.0.0.1:5173"]),
    ...(env.FRONTEND_ORIGIN || "").split(",").filter(value => value.trim()).map(normalizeOrigin),
  ]);
  return {
    origin: [...origins],
    // Keep bearer-token preflights working for Google login and admin requests.
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  };
};

module.exports = { createCorsOptions, PRODUCTION_ORIGIN };
