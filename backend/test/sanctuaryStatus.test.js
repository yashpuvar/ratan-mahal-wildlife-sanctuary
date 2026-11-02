const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateSanctuaryStatus, DAY_NAMES } = require("../services/sanctuaryStatus");

const baseSettings = () => ({
  scheduleConfigured: true,
  openingSoonMinutes: 60,
  weeklyHours: DAY_NAMES.map((day) => ({ day, closed: day === "sunday", openTime: "09:00", closeTime: "17:00" })),
  holidays: [],
  temporaryClosure: { active: false, reason: "" },
  manualOverride: "none",
  manualOverrideReason: "",
});

test("uses India Standard Time during scheduled hours", () => {
  const result = calculateSanctuaryStatus(baseSettings(), new Date("2026-11-03T04:00:00.000Z"));
  assert.equal(result.status, "open");
  assert.equal(result.timeZone, "Asia/Kolkata");
});

test("reports opening soon within the configured window", () => {
  const result = calculateSanctuaryStatus(baseSettings(), new Date("2026-11-03T03:00:00.000Z"));
  assert.equal(result.status, "openingSoon");
  assert.equal(result.nextOpening.time, "09:00");
});

test("reports closed before opening and provides today's next opening", () => {
  const result = calculateSanctuaryStatus(baseSettings(), new Date("2026-11-03T02:00:00.000Z"));
  assert.equal(result.status, "closed");
  assert.deepEqual(result.nextOpening, { date: "2026-11-03", time: "09:00", timeZone: "Asia/Kolkata" });
});

test("reports closed at the exact closing boundary and finds next day's opening", () => {
  const result = calculateSanctuaryStatus(baseSettings(), new Date("2026-11-03T11:30:00.000Z"));
  assert.equal(result.status, "closed");
  assert.equal(result.nextOpening.date, "2026-11-04");
});

test("weekly closed days are closed and next opening skips them", () => {
  const result = calculateSanctuaryStatus(baseSettings(), new Date("2026-11-01T04:00:00.000Z"));
  assert.equal(result.status, "closed");
  assert.equal(result.nextOpening.date, "2026-11-02");
});

test("special closure dates override normal weekly hours", () => {
  const settings = baseSettings();
  settings.holidays = [{ date: "2026-11-03", name: "Special closure" }];
  const result = calculateSanctuaryStatus(settings, new Date("2026-11-03T04:00:00.000Z"));
  assert.equal(result.status, "closed");
  assert.match(result.message, /Special closure/);
});

test("temporary closure overrides scheduled opening", () => {
  const settings = baseSettings();
  settings.temporaryClosure = { active: true, reason: "Maintenance" };
  const result = calculateSanctuaryStatus(settings, new Date("2026-11-03T04:00:00.000Z"));
  assert.equal(result.status, "closed");
  assert.equal(result.message, "Maintenance");
});

test("manual override takes priority even before schedule confirmation", () => {
  const settings = baseSettings();
  settings.scheduleConfigured = false;
  settings.manualOverride = "open";
  const result = calculateSanctuaryStatus(settings, new Date("2026-11-03T04:00:00.000Z"));
  assert.equal(result.status, "open");
});

test("unconfirmed schedule never reports an automatic open state", () => {
  const settings = baseSettings();
  settings.scheduleConfigured = false;
  const result = calculateSanctuaryStatus(settings, new Date("2026-11-03T04:00:00.000Z"));
  assert.equal(result.status, "unavailable");
});
