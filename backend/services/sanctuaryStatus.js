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
  for (let offset = 0; offset < 367; offset += 1) {
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

const confirmedSchedule = settings => settings?.scheduleConfigured === true &&
  Array.isArray(settings.weeklyHours) && settings.weeklyHours.length === 7 &&
  new Set(settings.weeklyHours.map(item => item?.day)).size === 7 &&
  settings.weeklyHours.every(item => item && DAY_NAMES.includes(item.day) && typeof item.closed === "boolean" &&
    (item.closed || (toMinutes(item.openTime) !== null && toMinutes(item.closeTime) > toMinutes(item.openTime))));

function calculateSanctuaryStatus(settings, now = new Date()) {
  const local = getIndiaParts(now);
  const date = dateKey(local);
  const day = local.weekday.toLowerCase();
  const confirmed = confirmedSchedule(settings);
  const schedule = Array.isArray(settings?.weeklyHours) ? settings.weeklyHours.find(item => item?.day === day) : null;
  const holiday = Array.isArray(settings?.holidays) ? settings.holidays.find(item => item?.date === date) : null;
  const today = confirmed ? { date, day, closed: Boolean(schedule.closed || holiday),
    openTime: schedule.closed ? null : schedule.openTime, closeTime: schedule.closed ? null : schedule.closeTime,
    closureReason: holiday ? (holiday.name || "Scheduled holiday") : schedule.closed ? "Weekly closed day" : "" } : null;
  const result = (status, message, nextOpening = null) => ({ status,
    label: { open: "Open Now", closed: "Closed Now", unconfirmed: "Hours Not Confirmed" }[status],
    message, timeZone: TIME_ZONE, nextOpening, today, scheduleConfigured: confirmed });
  // Emergency/temporary closures are safe even before hours are confirmed.
  // Legacy manual-open values never bypass confirmed hours or any closure.
  if (settings?.manualOverride === "closed") return result("closed", settings.manualOverrideReason || "The sanctuary is closed by an emergency override.");
  if (settings?.temporaryClosure?.active) return result("closed", settings.temporaryClosure.reason || "The sanctuary is temporarily closed.");
  if (!confirmed) return result("unconfirmed", settings?.scheduleConfigured ? "Opening hours need administrator review before they can be confirmed." : "Official sanctuary hours have not been confirmed. Please check before visiting.");
  const currentMinute = Number(local.hour) * 60 + Number(local.minute);
  const nextOpening = findNextOpening(settings, local, currentMinute);
  if (holiday) return result("closed", holiday.name ? "Closed for " + holiday.name + "." : "Closed for a scheduled holiday.", nextOpening);
  if (schedule.closed) return result("closed", "Today is a scheduled weekly closed day.", nextOpening);
  const openMinute = toMinutes(schedule.openTime);
  const closeMinute = toMinutes(schedule.closeTime);
  if (currentMinute >= openMinute && currentMinute < closeMinute) return result("open", "The sanctuary is open during its confirmed operating hours.");
  return result("closed", currentMinute < openMinute ? "Today's confirmed opening time is " + schedule.openTime + " IST." : "The sanctuary has closed for today.", nextOpening);
}

module.exports = { calculateSanctuaryStatus, confirmedSchedule, DAY_NAMES, toMinutes, TIME_ZONE };
