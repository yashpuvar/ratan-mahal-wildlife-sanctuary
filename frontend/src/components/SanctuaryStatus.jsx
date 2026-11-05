import { useContext, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SanctuaryStatusContext from "./SanctuaryStatusContext";
import { formatSanctuaryTime, STATUS_LABELS } from "../lib/sanctuaryStatus";

const useSanctuaryStatus = () => useContext(SanctuaryStatusContext) || { loading: true, status: null, hours: null };
const themes = {
  open: { dot: "bg-emerald-600", text: "text-emerald-900" },
  closed: { dot: "bg-rose-600", text: "text-rose-800" },
  unconfirmed: { dot: "bg-stone-500", text: "text-stone-700" },
};

export function StatusIndicator({ compact = false, className = "" }) {
  const { loading, error, status } = useSanctuaryStatus();
  const key = !loading && Object.hasOwn(themes, status?.status || "") ? status.status : "unconfirmed";
  const label = STATUS_LABELS[key];
  const button = useRef(null);
  const panel = useRef(null);
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 12, width: 300 });
  useEffect(() => {
    if (!expanded) return;
    const reposition = () => {
      const rect = button.current.getBoundingClientRect();
      const width = Math.min(360, window.innerWidth - 24);
      const top = Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 320));
      setPosition({ top, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), width, maxHeight: window.innerHeight - top - 12 });
    };
    const outside = event => { if (!button.current?.contains(event.target) && !panel.current?.contains(event.target)) setExpanded(false); };
    const escape = event => { if (event.key === "Escape") { setExpanded(false); button.current?.focus(); } };
    reposition();
    panel.current?.querySelector("button")?.focus();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [expanded]);
  const close = () => { setExpanded(false); button.current?.focus(); };
  return <>
    <button ref={button} type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}
      aria-label={`${label}. View sanctuary hours`} className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full border border-stone-200 bg-white px-3 py-2 shadow-sm transition hover:border-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${compact ? "text-xs" : "text-sm"} ${className}`}>
      <span aria-hidden="true" data-status={key} className={`h-2.5 w-2.5 shrink-0 rounded-full ${themes[key].dot}`} />
      <span aria-live="polite" className={`font-semibold ${themes[key].text}`}>{label}</span>
      <span aria-hidden="true" className="text-xs text-stone-500">⌄</span>
    </button>
    {expanded && createPortal(<div ref={panel} id={id} role="dialog" aria-label="Sanctuary hours details" className="fixed z-[110] max-h-[70vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 text-[#183D2B] shadow-2xl" style={position}>
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Sanctuary visitor hours</p><h2 className="mt-2 text-xl font-bold">{label}</h2></div><button onClick={close} aria-label="Close sanctuary information" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-100 text-xl hover:bg-stone-200">×</button></div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Today · Asia/Kolkata (IST)</p>
      <p className="mt-2 text-base font-semibold">{status?.today ? status.today.closed ? "Closed today" : `${formatSanctuaryTime(status.today.openTime)} – ${formatSanctuaryTime(status.today.closeTime)}` : "Official hours not confirmed"}</p>
      <p className="mt-3 text-sm leading-6 text-stone-700">{error ? "We cannot verify the current status. Please check again before visiting." : loading ? "Checking the latest official visitor information…" : status?.message || "The official schedule has not been confirmed by the sanctuary administrator."}</p>
      {status?.today?.closureReason && <p className="mt-2 text-sm font-medium text-rose-800">{status.today.closureReason}</p>}
      {status?.nextOpening && <p className="mt-3 border-t border-stone-200 pt-3 text-sm text-emerald-900">Next scheduled opening: {status.nextOpening.date}, {formatSanctuaryTime(status.nextOpening.time)} IST</p>}
    </div>, document.body)}
  </>;
}

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
export function SanctuaryStatusPanel({ className = "" }) {
  const { loading, error, status, hours } = useSanctuaryStatus();
  const byDay = new Map((hours?.weeklyHours || []).map(item => [item.day, item]));
  return <section aria-label="Sanctuary status and visitor hours" className={`rounded-2xl border border-stone-200 bg-white p-5 text-[#183D2B] shadow-sm sm:p-6 ${className}`}>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">Visitor information · India Standard Time</p><h2 className="mt-2 font-serif text-xl font-semibold sm:text-2xl">Sanctuary status</h2></div><StatusIndicator /></div>
    <p className="mt-3 text-sm leading-6 text-stone-700">{error ? "We cannot verify the current status. Please check again before visiting." : loading ? "Checking current visitor information…" : status?.message || "Official sanctuary hours have not been confirmed."}</p>
    <div className="mt-5 border-t border-stone-200 pt-4"><h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Confirmed weekly hours (IST)</h3>
      {!hours?.scheduleConfigured ? <p className="mt-2 text-sm text-stone-600">Hours pending official confirmation.</p> : <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">{days.map(day => {
        const item = byDay.get(day);
        return <li key={day} className="flex justify-between gap-4 text-stone-700"><span className="capitalize">{day}</span><span className="text-right">{!item || item.closed ? "Closed" : `${formatSanctuaryTime(item.openTime)}–${formatSanctuaryTime(item.closeTime)}`}</span></li>;
      })}</ul>}
    </div>
  </section>;
}
