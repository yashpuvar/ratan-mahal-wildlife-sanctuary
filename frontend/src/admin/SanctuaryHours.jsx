import { useEffect, useState } from "react";
import api from "../lib/api";

const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const dayLabel = (day) => day[0].toUpperCase() + day.slice(1);
const placeholderHours = () => dayOrder.map((day) => ({ day, closed: false, openTime: "09:00", closeTime: "17:00" }));

function SanctuaryHours() {
  const [settings, setSettings] = useState({ scheduleConfigured: false, openingSoonMinutes: 60, weeklyHours: placeholderHours(), holidays: [], temporaryClosure: { active: false, reason: "" }, manualOverride: "none", manualOverrideReason: "" });
  const [holidayText, setHolidayText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/sanctuary/admin/settings")
      .then(({ data }) => {
        const next = data.data;
        setSettings(next);
        setHolidayText((next.holidays || []).map(({ date, name }) => `${date}${name ? `, ${name}` : ""}`).join("\n"));
      })
      .catch((requestError) => {
        console.error("Could not load sanctuary admin settings:", requestError);
        setError("Sanctuary settings could not be loaded. Check the backend and try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateDay = (day, patch) => setSettings((current) => ({ ...current, weeklyHours: current.weeklyHours.map((item) => item.day === day ? { ...item, ...patch } : item) }));
  const updateClosure = (patch) => setSettings((current) => ({ ...current, temporaryClosure: { ...current.temporaryClosure, ...patch } }));

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    const holidays = holidayText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const [date, ...name] = line.split(",");
      return { date: date.trim(), name: name.join(",").trim() };
    });
    try {
      const { data } = await api.put("/api/sanctuary/admin/settings", {
        weeklyHours: settings.weeklyHours,
        holidays,
        temporaryClosure: settings.temporaryClosure,
        openingSoonMinutes: Number(settings.openingSoonMinutes),
        scheduleConfigured: settings.scheduleConfigured,
      });
      setSettings((current) => ({ ...current, ...data.data }));
      setNotice("Sanctuary hours and closure settings saved.");
      window.dispatchEvent(new Event("sanctuaryStatusChanged"));
    } catch (requestError) {
      console.error("Could not save sanctuary schedule:", requestError);
      setError(requestError.response?.data?.message || "Settings could not be saved. Please check the values and try again.");
    } finally { setSaving(false); }
  };

  const saveOverride = async (event) => {
    event.preventDefault();
    setSavingOverride(true); setError(""); setNotice("");
    try {
      const { data } = await api.put("/api/sanctuary/admin/override", { manualOverride: settings.manualOverride, reason: settings.manualOverrideReason });
      setSettings((current) => ({ ...current, ...data.data }));
      setNotice("Manual status override saved.");
      window.dispatchEvent(new Event("sanctuaryStatusChanged"));
    } catch (requestError) {
      console.error("Could not save sanctuary status override:", requestError);
      setError(requestError.response?.data?.message || "Manual status could not be saved.");
    } finally { setSavingOverride(false); }
  };

  return (
    <main className="min-h-screen bg-[#061a17] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Visitor information</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Sanctuary Hours &amp; Status</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">Configure the public opening schedule in India Standard Time. Example times are placeholders only. The schedule stays unavailable to visitors until you confirm official hours.</p>

        {loading ? <p role="status" className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-5 text-stone-300">Loading sanctuary settings…</p> : <>
          {error && <p role="alert" className="mt-6 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] p-4 text-sm text-rose-100">{error}</p>}
          {notice && <p role="status" className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4 text-sm text-emerald-100">{notice}</p>}

          <form onSubmit={saveSettings} className="mt-8 space-y-6">
            <section className="rounded-2xl border border-white/10 bg-[#0a211a] p-5 sm:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div><h2 className="text-xl font-semibold">Weekly opening hours</h2><p className="mt-2 max-w-xl text-xs leading-5 text-amber-100/80">The displayed 09:00–17:00 values are unverified examples, not published timings. Replace each open day with confirmed times before enabling the public schedule.</p></div>
                <label className="flex items-start gap-3 rounded-xl border border-emerald-200/15 bg-emerald-300/[0.04] p-3 text-xs leading-5 text-stone-200"><input type="checkbox" checked={settings.scheduleConfigured} onChange={(event) => setSettings((current) => ({ ...current, scheduleConfigured: event.target.checked }))} className="mt-1 accent-emerald-400" /><span>I confirm these are the sanctuary’s official operating hours.</span></label>
              </div>
              <div className="mt-6 divide-y divide-white/10">
                {settings.weeklyHours.map((item) => <div key={item.day} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
                  <span className="font-medium">{dayLabel(item.day)}</span>
                  <label className="flex items-center gap-2 text-sm text-stone-300"><input type="checkbox" checked={item.closed} onChange={(event) => updateDay(item.day, { closed: event.target.checked })} className="accent-emerald-400" />Closed</label>
                  <label className={`flex items-center gap-2 text-xs text-stone-400 ${item.closed ? "opacity-50" : ""}`}>Opens <input aria-label={`${dayLabel(item.day)} opening time`} type="time" disabled={item.closed} value={item.openTime} onChange={(event) => updateDay(item.day, { openTime: event.target.value })} className="rounded-lg border border-white/10 bg-[#061a17] px-2 py-2 text-sm text-white disabled:cursor-not-allowed" /></label>
                  <label className={`flex items-center gap-2 text-xs text-stone-400 ${item.closed ? "opacity-50" : ""}`}>Closes <input aria-label={`${dayLabel(item.day)} closing time`} type="time" disabled={item.closed} value={item.closeTime} onChange={(event) => updateDay(item.day, { closeTime: event.target.value })} className="rounded-lg border border-white/10 bg-[#061a17] px-2 py-2 text-sm text-white disabled:cursor-not-allowed" /></label>
                </div>)}
              </div>
              <label className="mt-5 block max-w-xs text-sm text-stone-300">Show “Opening Soon” within <span className="mt-2 flex items-center gap-2"><input type="number" min="1" max="180" value={settings.openingSoonMinutes} onChange={(event) => setSettings((current) => ({ ...current, openingSoonMinutes: event.target.value }))} className="w-24 rounded-lg border border-white/10 bg-[#061a17] px-3 py-2 text-white" /><span>minutes of opening</span></span></label>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0a211a] p-5 sm:p-7"><h2 className="text-lg font-semibold">Special closure dates</h2><p className="mt-2 text-xs leading-5 text-stone-400">One date per line in YYYY-MM-DD format. Optionally add a label after a comma. Example: 2026-12-25, Holiday closure</p><textarea value={holidayText} onChange={(event) => setHolidayText(event.target.value)} rows={5} placeholder="YYYY-MM-DD, Holiday name" className="mt-4 w-full rounded-xl border border-white/10 bg-[#061a17] px-3 py-3 text-sm text-white placeholder:text-stone-600" /></div>
              <div className="rounded-2xl border border-white/10 bg-[#0a211a] p-5 sm:p-7"><h2 className="text-lg font-semibold">Temporary closure</h2><p className="mt-2 text-xs leading-5 text-stone-400">This closure overrides the weekly schedule and holiday dates. A manual open override can still supersede it.</p><label className="mt-4 flex items-center gap-2 text-sm text-stone-200"><input type="checkbox" checked={settings.temporaryClosure.active} onChange={(event) => updateClosure({ active: event.target.checked })} className="accent-emerald-400" />Temporarily closed</label><label className="mt-4 block text-xs font-medium text-stone-400">Public reason<textarea value={settings.temporaryClosure.reason} onChange={(event) => updateClosure({ reason: event.target.value })} maxLength={300} rows={3} placeholder="Optional visitor-facing reason" className="mt-2 w-full rounded-xl border border-white/10 bg-[#061a17] px-3 py-3 text-sm text-white placeholder:text-stone-600" /></label></div>
            </section>
            <button type="submit" disabled={saving} className="min-h-12 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-[#062017] transition hover:bg-emerald-300 disabled:opacity-60">{saving ? "Saving hours…" : "Save opening hours"}</button>
          </form>

          <form onSubmit={saveOverride} className="mt-8 rounded-2xl border border-amber-200/15 bg-amber-300/[0.035] p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Manual status override</h2><p className="mt-2 text-xs leading-5 text-stone-400">A manual override takes priority over the schedule, holidays and temporary closure. Choose Automatic to restore scheduled status.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:items-end"><label className="block text-xs font-medium text-stone-400">Visitor status<select value={settings.manualOverride} onChange={(event) => setSettings((current) => ({ ...current, manualOverride: event.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-[#061a17] px-3 py-3 text-sm text-white"><option value="none">Automatic schedule</option><option value="open">Manually Open</option><option value="closed">Manually Closed</option></select></label><label className="block text-xs font-medium text-stone-400">Reason or visitor message<input value={settings.manualOverrideReason} onChange={(event) => setSettings((current) => ({ ...current, manualOverrideReason: event.target.value }))} maxLength={300} placeholder="Optional message" className="mt-2 w-full rounded-xl border border-white/10 bg-[#061a17] px-3 py-3 text-sm text-white placeholder:text-stone-600" /></label></div>
            <button type="submit" disabled={savingOverride} className="mt-5 min-h-12 rounded-xl border border-amber-200/25 px-6 py-3 text-sm font-bold text-amber-100 transition hover:bg-amber-300/10 disabled:opacity-60">{savingOverride ? "Saving status…" : "Save manual status"}</button>
          </form>
        </>}
      </div>
    </main>
  );
}

export default SanctuaryHours;
