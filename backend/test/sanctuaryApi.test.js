process.env.JWT_SECRET = "isolated-sanctuary-api-test-secret-at-least-32-characters";
const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const mongoose = require("mongoose");
mongoose.set("autoCreate", false);
mongoose.set("autoIndex", false);
const jwt = require("jsonwebtoken");
const Settings = require("../models/SanctuarySettings");
const Admin = require("../models/Admin");
const app = require("../server");
const { DAY_NAMES } = require("../services/sanctuaryStatus");
const { streamSanctuaryChanges, notifySanctuaryChange } = require("../services/sanctuaryEvents");

const draft = () => ({ scheduleConfigured: false, openingSoonMinutes: 60,
  weeklyHours: DAY_NAMES.map(day => ({ day, closed: false, openTime: "09:00", closeTime: "17:00" })), holidays: [],
  temporaryClosure: { active: false, reason: "" }, manualOverride: "none", manualOverrideReason: "", hotelOpen: false });

async function fixture(t, initial = null) {
  let stored = initial;
  t.mock.method(Settings, "findById", () => ({ lean: async () => stored, then: (resolve, reject) => Promise.resolve(stored).then(resolve, reject) }));
  const writes = t.mock.method(Settings, "findByIdAndUpdate", async (id, operation, options) => {
    assert.equal(id, "sanctuary");
    assert.equal(options.runValidators, true);
    assert.equal(options.upsert, true);
    assert.ok(!Object.hasOwn(operation.$set, "hotelOpen"));
    stored = { ...draft(), ...stored, ...operation.$set };
    return stored;
  });
  const admin = { _id: "fixture-admin", name: "Fixture", email: "fixture@example.test", passwordVersion: 0 };
  t.mock.method(Admin, "findById", () => ({ select: async () => admin }));
  const token = role => jwt.sign({ id: admin._id, role }, process.env.JWT_SECRET, { issuer: "ratan-mahal-api", audience: "ratan-mahal-client", algorithm: "HS256", expiresIn: "5m" });
  const server = app.listen(0, "127.0.0.1");
  t.after(() => server.close());
  await new Promise(resolve => server.once("listening", resolve));
  const request = async (path, body, role) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/sanctuary${path}`, {
      ...(body ? { method: "PUT", body: JSON.stringify(body) } : {}),
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(role ? { Authorization: `Bearer ${token(role)}` } : {}) },
    });
    return { status: response.status, headers: response.headers, body: await response.json() };
  };
  return { request, writes, stored: () => stored };
}

test("public GETs do not create settings or publish placeholder hours", async t => {
  const f = await fixture(t);
  const status = await f.request("/status");
  assert.equal(status.body.data.label, "Hours Not Confirmed");
  assert.equal(status.body.data.today, null);
  assert.equal(status.headers.get("cache-control"), "no-store");
  assert.deepEqual((await f.request("/hours")).body.data.weeklyHours, []);
  assert.equal(f.writes.mock.callCount(), 0);
  assert.ok(new Settings().weeklyHours.every(day => day.openTime === "" && day.closeTime === ""));
});

test("only authenticated admins can read/edit settings and override closures", async t => {
  const f = await fixture(t);
  for (const role of [undefined, "user"]) {
    assert.equal((await f.request("/admin/settings", undefined, role)).status, role ? 403 : 401);
    assert.equal((await f.request("/admin/settings", draft(), role)).status, role ? 403 : 401);
    assert.equal((await f.request("/admin/override", { manualOverride: "closed" }, role)).status, role ? 403 : 401);
  }
  assert.equal(f.writes.mock.callCount(), 0);
});

test("saving a verified schedule persists through MongoDB update and returns one coherent public snapshot", async t => {
  const f = await fixture(t);
  const body = { ...draft(), scheduleConfigured: true };
  const saved = await f.request("/admin/settings", body, "admin");
  assert.equal(saved.status, 200);
  assert.equal(saved.body.publicStatus.scheduleConfigured, true);
  assert.equal(saved.body.publicStatus.timeZone, "Asia/Kolkata");
  assert.ok(Date.parse(saved.body.publicStatus.validUntil) - Date.parse(saved.body.publicStatus.checkedAt) <= 15000);
  assert.deepEqual((await f.request("/status")).body.data.hours.weeklyHours, body.weeklyHours);
  assert.equal(f.writes.mock.callCount(), 1);
});

test("unconfirmed drafts, including saved legacy examples, never publish hours", async t => {
  const f = await fixture(t);
  assert.equal((await f.request("/admin/settings", draft(), "admin")).status, 200);
  const publicStatus = (await f.request("/status")).body.data;
  assert.equal(publicStatus.status, "unconfirmed");
  assert.deepEqual(publicStatus.hours.weeklyHours, []);
});

test("invalid or unverified inputs are rejected without writes", async t => {
  const f = await fixture(t);
  const blankConfirmed = { ...draft(), scheduleConfigured: true, weeklyHours: DAY_NAMES.map(day => ({ day, closed: false, openTime: "", closeTime: "" })) };
  const duplicates = { ...draft(), weeklyHours: Array(7).fill(draft().weeklyHours[0]) };
  const reversed = { ...draft(), weeklyHours: draft().weeklyHours.map(day => ({ ...day, closeTime: "08:00" })) };
  for (const body of [blankConfirmed, duplicates, reversed, { ...draft(), scheduleConfigured: "true" }, { ...draft(), holidays: [{ date: "2026-02-30", name: "Invalid" }] }]) {
    assert.equal((await f.request("/admin/settings", body, "admin")).status, 400);
  }
  assert.equal((await f.request("/admin/override", { manualOverride: "open" }, "admin")).status, 400);
  assert.equal(f.writes.mock.callCount(), 0);
});

test("blank unconfirmed drafts and closed days are supported without invented times", async t => {
  const f = await fixture(t);
  const blank = { ...draft(), weeklyHours: DAY_NAMES.map(day => ({ day, closed: false, openTime: "", closeTime: "" })) };
  assert.equal((await f.request("/admin/settings", blank, "admin")).status, 200);
  const closedWeek = { ...blank, scheduleConfigured: true, weeklyHours: blank.weeklyHours.map(day => ({ ...day, closed: true })) };
  assert.equal((await f.request("/admin/settings", closedWeek, "admin")).status, 200);
  assert.equal((await f.request("/status")).body.data.status, "closed");
});

test("emergency closure is public immediately and removing it never opens an unconfirmed schedule", async t => {
  const f = await fixture(t, draft());
  const closed = await f.request("/admin/override", { manualOverride: "closed", reason: "Emergency maintenance" }, "admin");
  assert.equal(closed.body.publicStatus.status, "closed");
  assert.equal((await f.request("/status")).body.data.message, "Emergency maintenance");
  await f.request("/admin/override", { manualOverride: "none" }, "admin");
  assert.equal((await f.request("/status")).body.data.status, "unconfirmed");
});

test("database lookup failure is 503 and never returns an open status", async t => {
  const f = await fixture(t);
  t.mock.method(console, "error", () => {});
  t.mock.method(Settings, "findById", () => ({ lean: async () => { throw new Error("fixture unavailable"); } }));
  const response = await f.request("/status");
  assert.equal(response.status, 503);
  assert.equal(response.body.success, false);
  assert.equal(response.body.data, undefined);
});

test("live notifications trigger refresh and release listeners after disconnect", () => {
  const res = new EventEmitter();
  const messages = [];
  res.set = headers => assert.equal(headers["Content-Type"], "text/event-stream");
  res.flushHeaders = () => {};
  res.write = value => messages.push(value);
  streamSanctuaryChanges({}, res);
  assert.equal(messages.length, 1);
  notifySanctuaryChange();
  assert.equal(messages.length, 2);
  res.emit("close");
  notifySanctuaryChange();
  assert.equal(messages.length, 2);
});
