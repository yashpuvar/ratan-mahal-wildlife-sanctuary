const SanctuarySettings = require("../models/SanctuarySettings");
const { calculateSanctuaryStatus, DAY_NAMES } = require("../services/sanctuaryStatus");

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const isValidDate = (value) => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const safeSettings = (settings) => ({
  scheduleConfigured: settings.scheduleConfigured,
  openingSoonMinutes: settings.openingSoonMinutes,
  weeklyHours: settings.weeklyHours,
  holidays: settings.holidays,
  temporaryClosure: settings.temporaryClosure,
  manualOverride: settings.manualOverride,
  manualOverrideReason: settings.manualOverrideReason,
});

const getSettings = async () => SanctuarySettings.findById("sanctuary").lean();

const getPublicStatus = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: { ...calculateSanctuaryStatus(settings), scheduleConfigured: Boolean(settings?.scheduleConfigured) } });
  } catch (error) {
    console.error("Public sanctuary status lookup failed:", error.message);
    res.status(503).json({ success: false, message: "Sanctuary status is temporarily unavailable" });
  }
};

const getPublicHours = async (req, res) => {
  try {
    const settings = await getSettings();
    const data = !settings || !settings.scheduleConfigured
      ? { scheduleConfigured: false, weeklyHours: [], holidays: [], temporaryClosure: { active: Boolean(settings?.temporaryClosure?.active), reason: settings?.temporaryClosure?.reason || "" }, manualOverride: settings?.manualOverride || "none", openingSoonMinutes: settings?.openingSoonMinutes || 60 }
      : safeSettings(settings);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Public sanctuary hours lookup failed:", error.message);
    res.status(503).json({ success: false, message: "Sanctuary hours are temporarily unavailable" });
  }
};

const getAdminSettings = async (req, res) => {
  try {
    const settings = await SanctuarySettings.findById("sanctuary");
    res.json({ success: true, data: settings ? safeSettings(settings) : safeSettings(new SanctuarySettings()) });
  } catch (error) {
    console.error("Admin sanctuary settings lookup failed:", error.message);
    res.status(500).json({ success: false, message: "Could not load sanctuary settings" });
  }
};

const saveSettings = async (req, res) => {
  const { weeklyHours, holidays, temporaryClosure, openingSoonMinutes, scheduleConfigured } = req.body;
  if (!Array.isArray(weeklyHours) || weeklyHours.length !== 7 || !Array.isArray(holidays)) {
    return res.status(400).json({ success: false, message: "A complete weekly schedule and holiday list are required" });
  }
  const days = new Set();
  for (const entry of weeklyHours) {
    if (!entry || !DAY_NAMES.includes(entry.day) || days.has(entry.day) || typeof entry.closed !== "boolean" || !TIME_PATTERN.test(entry.openTime) || !TIME_PATTERN.test(entry.closeTime)) {
      return res.status(400).json({ success: false, message: "Each weekday needs valid opening and closing times and a closed-day setting" });
    }
    const [oh, om] = entry.openTime.split(":").map(Number);
    const [ch, cm] = entry.closeTime.split(":").map(Number);
    if (!entry.closed && ch * 60 + cm <= oh * 60 + om) {
      return res.status(400).json({ success: false, message: `Closing time must be after opening time on ${entry.day}` });
    }
    days.add(entry.day);
  }
  if (typeof scheduleConfigured !== "boolean" || !Number.isInteger(openingSoonMinutes) || openingSoonMinutes < 1 || openingSoonMinutes > 180) {
    return res.status(400).json({ success: false, message: "Confirm the schedule and set opening-soon minutes from 1 to 180" });
  }
  if (holidays.length > 100 || holidays.some((item) => !item || !isValidDate(item.date) || typeof item.name !== "string" || item.name.length > 100)) {
    return res.status(400).json({ success: false, message: "Holiday dates must be valid YYYY-MM-DD values (maximum 100)" });
  }
  const uniqueHolidayDates = new Set(holidays.map((item) => item.date));
  if (uniqueHolidayDates.size !== holidays.length) return res.status(400).json({ success: false, message: "Holiday dates must not be duplicated" });
  if (!temporaryClosure || typeof temporaryClosure.active !== "boolean" || typeof temporaryClosure.reason !== "string" || temporaryClosure.reason.length > 300) {
    return res.status(400).json({ success: false, message: "Temporary closure settings are invalid" });
  }

  try {
    const settings = await SanctuarySettings.findByIdAndUpdate("sanctuary", {
      $set: {
        weeklyHours: weeklyHours.map(({ day, closed, openTime, closeTime }) => ({ day, closed, openTime, closeTime })),
        holidays: holidays.map(({ date, name }) => ({ date, name: name.trim() })),
        temporaryClosure: { active: temporaryClosure.active, reason: temporaryClosure.reason.trim() },
        openingSoonMinutes,
        scheduleConfigured,
      },
    }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    res.json({ success: true, message: "Sanctuary hours saved", data: safeSettings(settings) });
  } catch (error) {
    console.error("Admin sanctuary schedule save failed:", error.message);
    res.status(500).json({ success: false, message: "Could not save sanctuary hours" });
  }
};

const saveOverride = async (req, res) => {
  const { manualOverride, reason = "" } = req.body;
  if (!(["none", "open", "closed"].includes(manualOverride)) || typeof reason !== "string" || reason.length > 300) {
    return res.status(400).json({ success: false, message: "Choose a valid manual status and reason" });
  }
  try {
    const settings = await SanctuarySettings.findByIdAndUpdate("sanctuary", {
      $set: { manualOverride, manualOverrideReason: reason.trim() },
    }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    res.json({ success: true, message: "Manual status override saved", data: safeSettings(settings) });
  } catch (error) {
    console.error("Admin sanctuary override save failed:", error.message);
    res.status(500).json({ success: false, message: "Could not save manual status" });
  }
};

module.exports = { getPublicStatus, getPublicHours, getAdminSettings, saveSettings, saveOverride };
