require("dotenv").config({ quiet: true });
const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { loginAdmin } = require("../controllers/adminAuthController");
const { requireAdmin } = require("../middleware/authMiddleware");

const fixturePassword = "Local-test-password-9284";

async function fixtureAdmin() {
  const passwordHash = await bcrypt.hash(fixturePassword, 10);
  return new Admin({ name: "Test Admin", email: "admin-fixture@example.test", password: passwordHash });
}

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("correct admin email and bcrypt password return an admin JWT", async (t) => {
  const admin = await fixtureAdmin();
  t.mock.method(Admin, "findOne", async ({ email }) => email === admin.email ? admin : null);
  const res = responseRecorder();
  await loginAdmin({ body: { email: admin.email.toUpperCase(), password: fixturePassword } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.admin.role, "admin");
  const claims = jwt.verify(res.body.token, process.env.JWT_SECRET, { issuer: "ratan-mahal-api", audience: "ratan-mahal-client", algorithms: ["HS256"] });
  assert.equal(claims.role, "admin");
  assert.equal(String(claims.id), String(admin._id));
});

test("incorrect admin password is rejected", async (t) => {
  const admin = await fixtureAdmin();
  t.mock.method(Admin, "findOne", async () => admin);
  const res = responseRecorder();
  await loginAdmin({ body: { email: admin.email, password: "incorrect-fixture-password" } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Invalid email or password");
});

test("unknown admin email is rejected with the same generic response", async (t) => {
  t.mock.method(Admin, "findOne", async () => null);
  const res = responseRecorder();
  await loginAdmin({ body: { email: "unknown-fixture@example.test", password: fixturePassword } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Invalid email or password");
});

test("admin JWT passes admin middleware and public-user JWT is denied", async (t) => {
  const admin = await fixtureAdmin();
  t.mock.method(Admin, "findById", () => ({ select: async () => admin }));
  const token = (role) => jwt.sign({ id: String(admin._id), role }, process.env.JWT_SECRET, {
    expiresIn: "5m", algorithm: "HS256", issuer: "ratan-mahal-api", audience: "ratan-mahal-client",
  });
  const invoke = (authToken) => new Promise((resolve) => {
    const req = { headers: authToken ? { authorization: `Bearer ${authToken}` } : {} };
    const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; resolve({ statusCode: this.statusCode, body }); } };
    requireAdmin(req, res, () => resolve({ statusCode: 200, admin: req.admin }));
  });
  const allowed = await invoke(token("admin"));
  const denied = await invoke(token("user"));
  assert.equal(allowed.statusCode, 200);
  assert.equal(denied.statusCode, 403);
});
