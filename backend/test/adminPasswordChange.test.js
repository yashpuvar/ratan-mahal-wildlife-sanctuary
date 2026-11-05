process.env.JWT_SECRET = "isolated-password-change-test-secret-at-least-32-chars";
const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
mongoose.set("autoCreate", false);
mongoose.set("autoIndex", false);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Contact = require("../models/contact");
const app = require("../server");

const temporary = "Fixture-only-temporary-password-123";
const permanent = "Fixture-only-permanent-password-456";
async function setup(t) {
  const admin = Admin.hydrate({ _id: new mongoose.Types.ObjectId(), __v: 0, name: "Fixture Admin", email: "fixture@example.test",
    password: await bcrypt.hash(temporary, 10), mustChangePassword: true, passwordVersion: 0,
    temporaryPasswordExpiresAt: new Date(Date.now() + 3600000) });
  t.mock.method(Admin, "findOne", async ({ email }) => email === admin.email ? admin : null);
  t.mock.method(Admin, "findById", () => ({ select: async () => admin, then: (resolve, reject) => Promise.resolve(admin).then(resolve, reject) }));
  const writes = t.mock.method(Admin.collection, "updateOne", async (query, update) => {
    assert.equal(query.__v, 0, "password change must use optimistic concurrency");
    assert.equal(update.$set.mustChangePassword, false);
    assert.equal(update.$set.passwordVersion, 1);
    assert.equal(update.$set.temporaryPasswordExpiresAt, null);
    assert.notEqual(update.$set.password, permanent);
    assert.equal(await bcrypt.compare(permanent, update.$set.password), true);
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  });
  t.mock.method(Contact, "find", () => ({ sort: async () => [] }));
  const server = app.listen(0, "127.0.0.1");
  t.after(() => server.close());
  await new Promise(resolve => server.once("listening", resolve));
  const request = async (path, { token, body } = {}) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method: body ? "POST" : "GET",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() };
  };
  const login = () => request("/api/admin/login", { body: { email: admin.email, password: temporary } });
  return { admin, request, login, writes };
}

test("temporary login issues a 15-minute restricted token; /me works but direct admin requests are blocked", async t => {
  const f = await setup(t);
  const login = await f.login();
  assert.equal(login.status, 200);
  const claims = jwt.verify(login.body.token, process.env.JWT_SECRET);
  assert.equal(claims.purpose, "admin-password-change");
  assert.equal(claims.exp - claims.iat, 900);
  const me = await f.request("/api/admin/me", { token: login.body.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.admin.mustChangePassword, true);
  for (const path of ["/api/contacts", "/api/posts"]) {
    const blocked = await f.request(path, { token: login.body.token, ...(path === "/api/posts" ? { body: { title: "Must not be created" } } : {}) });
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body.code, "ADMIN_PASSWORD_CHANGE_REQUIRED");
  }
  assert.equal(f.writes.mock.callCount(), 0);
});

test("password change uses real bcrypt hook, invalidates old tokens, and enables standard admin access", async t => {
  const f = await setup(t);
  const oldToken = (await f.login()).body.token;
  const changed = await f.request("/api/admin/change-password", { token: oldToken, body: { currentPassword: temporary, newPassword: permanent } });
  assert.equal(changed.status, 200);
  assert.equal(changed.body.admin.mustChangePassword, false);
  assert.equal(f.writes.mock.callCount(), 1);
  const claims = jwt.verify(changed.body.token, process.env.JWT_SECRET);
  assert.equal(claims.credentialVersion, 1);
  assert.equal(claims.purpose, undefined);
  assert.equal((await f.request("/api/admin/me", { token: oldToken })).status, 401);
  assert.equal((await f.request("/api/admin/me", { token: changed.body.token })).status, 200);
  assert.equal((await f.request("/api/contacts", { token: changed.body.token })).status, 200);
  assert.equal((await f.login()).status, 401);
  assert.equal((await f.request("/api/admin/login", { body: { email: f.admin.email, password: permanent } })).status, 200);
  assert.equal((await f.request("/api/admin/change-password", { token: oldToken, body: { currentPassword: temporary, newPassword: permanent } })).status, 401);
});

for (const [label, body, status] of [
  ["wrong temporary password", { currentPassword: "wrong", newPassword: permanent }, 401],
  ["reuse of temporary password", { currentPassword: temporary, newPassword: temporary }, 400],
  ["short password", { currentPassword: temporary, newPassword: "short" }, 400],
  ["UTF-8 bcrypt truncation", { currentPassword: temporary, newPassword: "é".repeat(37) }, 400],
]) test(`rejects ${label} without saving`, async t => {
  const f = await setup(t);
  const token = (await f.login()).body.token;
  assert.equal((await f.request("/api/admin/change-password", { token, body })).status, status);
  assert.equal(f.writes.mock.callCount(), 0);
});

test("expired temporary credentials cannot login or use an already issued restricted token", async t => {
  const f = await setup(t);
  const token = (await f.login()).body.token;
  f.admin.temporaryPasswordExpiresAt = new Date(0);
  assert.equal((await f.login()).status, 401);
  assert.equal((await f.request("/api/admin/me", { token })).status, 401);
  assert.equal(f.writes.mock.callCount(), 0);
});

test("anonymous and public-user tokens cannot change an admin password", async t => {
  const f = await setup(t);
  const body = { currentPassword: temporary, newPassword: permanent };
  assert.equal((await f.request("/api/admin/change-password", { body })).status, 401);
  const token = jwt.sign({ id: String(f.admin._id), role: "user" }, process.env.JWT_SECRET, { issuer: "ratan-mahal-api", audience: "ratan-mahal-client", algorithm: "HS256" });
  assert.equal((await f.request("/api/admin/change-password", { token, body })).status, 403);
  assert.equal(f.writes.mock.callCount(), 0);
});
