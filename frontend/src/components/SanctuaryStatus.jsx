import { useContext } from "react";
import SanctuaryStatusContext from "./SanctuaryStatusContext";

const useSanctuaryStatus = () => useContext(SanctuaryStatusContext) || { loading: true, status: null, hours: null };

const styles = {
  open: { dot: "bg-emerald-600", text: "text-emerald-900" },
  closed: { dot: "bg-rose-600", text: "text-rose-800" },
  openingSoon: { dot: "bg-amber-500", text: "text-amber-800" },
  unavailable: { dot: "bg-stone-500", text: "text-stone-700" },
};

export function StatusIndicator({ compact = false, className = "" }) {
  const { loading, status } = useSanctuaryStatus();
  const key = loading ? "unavailable" : status?.status || "unavailable";
  const theme = styles[key] || styles.unavailable;
  const label = loading ? "Checking status" : status?.label || "Status unavailable";
  const message = loading ? "Checking current visitor information…" : status?.message || "We could not verify the sanctuary status right now.";

  return (
    <div role="status" aria-live="polite" className={`inline-flex items-center gap-2 rounded-full border border-[#E3EAE4] bg-white px-3 py-2 shadow-sm ${compact ? "text-xs" : "text-sm"} ${className}`} title={message}>
      <span className={`relative h-2.5 w-2.5 shrink-0 rounded-full ${theme.dot} ${key === "open" ? "animate-pulse" : ""}`} />
      <span className={`font-semibold ${theme.text}`}>{label}</span>
    </div>
  );
}

const dayLabels = { monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday" };

export function SanctuaryStatusPanel({ className = "" }) {
  const { loading, status, hours } = useSanctuaryStatus();
  const configured = Boolean(hours?.scheduleConfigured);
  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const hoursByDay = new Map((hours?.weeklyHours || []).map((item) => [item.day, item]));

  return (
    <section aria-label="Sanctuary status and visitor hours" className={`rounded-2xl border border-white/10 bg-[#0a211a] p-5 shadow-lg shadow-black/10 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Visitor information · India Standard Time</p><h2 className="mt-2 font-serif text-xl font-semibold sm:text-2xl">Sanctuary status</h2></div>
        <StatusIndicator />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-300">{loading ? "Fetching the latest visitor status…" : status?.message || "Status unavailable. Please try again later."}</p>
      {status?.nextOpening && <p className="mt-2 text-sm font-medium text-amber-100">Next opening: {status.nextOpening.date} at {status.nextOpening.time} IST</p>}
      <div className="mt-5 border-t border-white/10 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-stone-300">Weekly hours</h3>
        {!configured ? <p className="mt-2 text-sm text-stone-400">Hours pending official confirmation.</p> : (
          <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {dayOrder.map((day) => {
              const item = hoursByDay.get(day);
              return <li key={day} className="flex justify-between gap-4 text-stone-300"><span>{dayLabels[day]}</span><span className="text-right text-stone-400">{!item || item.closed ? "Closed" : `${item.openTime}–${item.closeTime}`}</span></li>;
            })}
          </ul>
        )}
        {configured && hours?.holidays?.length > 0 && <p className="mt-3 text-xs text-stone-500">Holiday closures may apply; please check the status above before visiting.</p>}
      </div>
    </section>
  );
}
