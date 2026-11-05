export const STATUS_LABELS = { open: "Open Now", closed: "Closed Now", unconfirmed: "Hours Not Confirmed" };

export function snapshotLifetime(data, elapsed = 0) {
  if (!data || !Object.hasOwn(STATUS_LABELS, data.status) || data.timeZone !== "Asia/Kolkata" ||
      (data.status === "open" && data.scheduleConfigured !== true)) return 0;
  const duration = Date.parse(data.validUntil) - Date.parse(data.checkedAt);
  return Number.isFinite(duration) && duration > 0 && duration <= 15000 ? Math.max(0, duration - elapsed) : 0;
}

export function formatSanctuaryTime(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || "")) return "Not confirmed";
  const [hours, minutes] = value.split(":");
  return `${Number(hours) % 12 || 12}:${minutes} ${Number(hours) >= 12 ? "PM" : "AM"}`;
}
