const TIME_ZONE = "Asia/Kolkata";
const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  weekday: "long",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const getIndiaParts = (date) => Object.fromEntries(formatter.formatToParts(date)
  .filter(({ type }) => type !== "literal")
  .map(({ type, value }) => [type, value]));

const toMinutes = (value) => {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};

const dateKey = ({ year, month, day }) => `${year}-${month}-${day}`;

const findNextOpening = (settings, today, currentMinute) => {
  const todayIndex = DAY_NAMES.indexOf(today.weekday.toLowerCase());
  for (let offset = 0; offset < 8; offset += 1) {
    const weekday = DAY_NAMES[(todayIndex + offset) % 7];
    const daySchedule = settings.weeklyHours?.find((item) => item.day === weekday);
    if (!daySchedule || daySchedule.closed) continue;
    const openMinute = toMinutes(daySchedule.openTime);
    if (openMinute === null) continue;
    if (offset === 0 && openMinute <= currentMinute) continue;
    const targetDate = new Date(Date.UTC(Number(today.year), Number(today.month) - 1, Number(today.day) + offset));
    const dateParts = {
      year: String(targetDate.getUTCFullYear()),
      month: String(targetDate.getUTCMonth() + 1).padStart(2, "0"),
      day: String(targetDate.getUTCDate()).padStart(2, "0"),
    };
    if (settings.holidays?.some((holiday) => holiday.date === dateKey(dateParts))) continue;
    if (settings.temporaryClosure?.active) continue;
    return { date: dateKey(dateParts), time: daySchedule.openTime, timeZone: TIME_ZONE };
  }
  return null;
};

function calculateSanctuaryStatus(settings, now = new Date()) {
  if (!settings) {
    return { status: "unavailable", label: "Status unavailable", message: "Opening hours have not been confirmed yet.", timeZone: TIME_ZONE, nextOpening: null };
  }

  const override = settings.manualOverride || "none";
  if (override === "open") return { status: "open", label: "Open Now", message: settings.manualOverrideReason || "Welcome! We are currently open.", timeZone: TIME_ZONE, nextOpening: null };
  if (override === "closed") return { status: "closed", label: "Closed Now", message: settings.manualOverrideReason || "We are currently closed. Please check our opening hours.", timeZone: TIME_ZONE, nextOpening: null };
  if (settings.temporaryClosure?.active) {
    return { status: "closed", label: "Closed Now", message: settings.temporaryClosure.reason || "The sanctuary is temporarily closed.", timeZone: TIME_ZONE, nextOpening: null };
  }
  if (!settings.scheduleConfigured) {
    return { status: "unavailable", label: "Status unavailable", message: "Opening hours have not been confirmed yet.", timeZone: TIME_ZONE, nextOpening: null };
  }

  const local = getIndiaParts(now);
  const today = dateKey(local);
  const currentMinute = Number(local.hour) * 60 + Number(local.minute);
  const minutesUntil = (time) => {
    const openingMinute = toMinutes(time);
    return openingMinute === null ? null : openingMinute - currentMinute;
  };
  const holiday = settings.holidays?.find((item) => item.date === today);
  const daySchedule = settings.weeklyHours?.find((item) => item.day === local.weekday.toLowerCase());
  const nextOpening = findNextOpening(settings, local, currentMinute);
  if (holiday) return { status: "closed", label: "Closed Now", message: holiday.name ? `Closed for ${holiday.name}.` : "We are currently closed for a scheduled holiday.", timeZone: TIME_ZONE, nextOpening };
  if (!daySchedule || daySchedule.closed) return { status: "closed", label: "Closed Now", message: "We are currently closed today. Please check our opening hours.", timeZone: TIME_ZONE, nextOpening };

  const openMinute = toMinutes(daySchedule.openTime);
  const closeMinute = toMinutes(daySchedule.closeTime);
  if (openMinute === null || closeMinute === null || closeMinute <= openMinute) {
    return { status: "unavailable", label: "Status unavailable", message: "Opening hours need administrator review.", timeZone: TIME_ZONE, nextOpening: null };
  }
  if (currentMinute >= openMinute && currentMinute < closeMinute) {
    return { status: "open", label: "Open Now", message: "Welcome! We are currently open.", timeZone: TIME_ZONE, nextOpening: null };
  }
  if (currentMinute < openMinute && minutesUntil(daySchedule.openTime) <= (settings.openingSoonMinutes || 60)) {
    return { status: "openingSoon", label: "Opening Soon", message: `Opening at ${daySchedule.openTime} IST.`, timeZone: TIME_ZONE, nextOpening: { date: today, time: daySchedule.openTime, timeZone: TIME_ZONE } };
  }
  return { status: "closed", label: "Closed Now", message: "We are currently closed. Please check our opening hours.", timeZone: TIME_ZONE, nextOpening };
}

module.exports = { calculateSanctuaryStatus, DAY_NAMES, toMinutes, TIME_ZONE };
