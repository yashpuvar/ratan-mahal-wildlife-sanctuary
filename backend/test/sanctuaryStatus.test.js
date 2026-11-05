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

test("reports closed until the confirmed opening time, including the former opening-soon window", () => {
  const result = calculateSanctuaryStatus(baseSettings(), new Date("2026-11-03T03:00:00.000Z"));
  assert.equal(result.status, "closed");
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

test("legacy manual-open override cannot bypass official confirmation", () => {
  const settings = baseSettings();
  settings.scheduleConfigured = false;
  settings.manualOverride = "open";
  const result = calculateSanctuaryStatus(settings, new Date("2026-11-03T04:00:00.000Z"));
  assert.equal(result.status, "unconfirmed");
});

test("unconfirmed schedule never reports an automatic open state", () => {
  const settings = baseSettings();
  settings.scheduleConfigured = false;
  const result = calculateSanctuaryStatus(settings, new Date("2026-11-03T04:00:00.000Z"));
  assert.equal(result.status, "unconfirmed");
});

test("missing settings show Hours Not Confirmed without publishing example times", () => {
  const result = calculateSanctuaryStatus(null);
  assert.equal(result.label, "Hours Not Confirmed");
  assert.equal(result.today, null);
  assert.equal(result.scheduleConfigured, false);
});

test("opens at the exact boundary, with confirmed local-day hours", () => {
  const result = calculateSanctuaryStatus(baseSettings(), new Date("2026-11-03T03:30:00Z"));
  assert.equal(result.status, "open");
  assert.equal(result.today.day, "tuesday");
  assert.equal(result.today.openTime, "09:00");
});

test("UTC previous day is the correct next local day at India midnight", () => {
  const result = calculateSanctuaryStatus(baseSettings(), new Date("2026-11-02T18:30:00Z"));
  assert.equal(result.today.date, "2026-11-03");
  assert.equal(result.status, "closed");
});

test("manual emergency closure wins before confirmation and over temporary closure", () => {
  const settings = { ...baseSettings(), scheduleConfigured: false, manualOverride: "closed", manualOverrideReason: "Emergency closure", temporaryClosure: { active: true, reason: "Maintenance" } };
  const result = calculateSanctuaryStatus(settings);
  assert.equal(result.status, "closed");
  assert.equal(result.message, "Emergency closure");
  assert.equal(result.today, null);
});

test("legacy manual-open can never defeat temporary or holiday closures", () => {
  const settings = { ...baseSettings(), manualOverride: "open", temporaryClosure: { active: true, reason: "Maintenance" } };
  assert.equal(calculateSanctuaryStatus(settings).status, "closed");
  settings.temporaryClosure.active = false;
  settings.holidays = [{ date: "2026-11-03", name: "Closure" }];
  assert.equal(calculateSanctuaryStatus(settings, new Date("2026-11-03T04:00:00Z")).status, "closed");
});

test("incomplete or invalid confirmed schedules fail closed to unconfirmed", () => {
  for (const weeklyHours of [[], [null], baseSettings().weeklyHours.slice(1), baseSettings().weeklyHours.map(item => ({ ...item, openTime: "" }))]) {
    const result = calculateSanctuaryStatus({ ...baseSettings(), weeklyHours });
    assert.equal(result.status, "unconfirmed");
    assert.equal(result.today, null);
  }
});

test("temporary closure works without confirmed hours", () => {
  const result = calculateSanctuaryStatus({ scheduleConfigured: false, temporaryClosure: { active: true, reason: "Monsoon closure" } });
  assert.equal(result.status, "closed");
  assert.equal(result.message, "Monsoon closure");
});
