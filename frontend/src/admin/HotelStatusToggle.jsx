import { useEffect, useState } from "react";
import api from "../lib/api";

export default function HotelStatusToggle() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { api.get("/api/sanctuary/hotel-status").then(({ data }) => setOpen(data?.data?.open === true)).catch((error) => { console.error("Hotel status lookup failed", error); setMessage("Could not load the saved hotel status."); }).finally(() => setLoading(false)); }, []);
  const save = async (nextOpen) => {
    setSaving(true); setMessage("");
    try { const { data } = await api.put("/api/sanctuary/admin/hotel-status", { open: nextOpen }); setOpen(data.data.open); setMessage("Hotel status saved."); }
    catch (error) { console.error("Hotel status save failed", error); setMessage(error.response?.data?.message || "Hotel status could not be saved."); }
    finally { setSaving(false); }
  };
  return <section className="mt-8 rounded-2xl border border-emerald-300/20 bg-[#08231e] p-6 sm:p-8" aria-labelledby="hotel-admin-status"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Stay / Hotel</p><h2 id="hotel-admin-status" className="mt-2 text-xl font-bold">Accommodation status</h2><p className="mt-2 text-sm text-gray-300">Default is temporarily closed. Enquiries can only be accepted when set to open.</p></div><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-4 py-2 text-xs font-extrabold ${open ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>{loading ? "LOADING…" : open ? "OPEN" : "TEMPORARILY CLOSED"}</span><button type="button" disabled={loading || saving || open} onClick={() => save(true)} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">Set Open</button><button type="button" disabled={loading || saving || !open} onClick={() => save(false)} className="rounded-xl border border-red-300/50 px-4 py-3 text-sm font-bold text-red-100 disabled:opacity-50">Temporarily Close</button></div></div>{message && <p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}</section>;
}
