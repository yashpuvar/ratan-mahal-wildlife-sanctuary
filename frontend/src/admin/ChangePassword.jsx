import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", repeat: "" });
  useEffect(() => {
    let active = true;
    if (!localStorage.getItem("adminToken")) { navigate("/admin/login", { replace: true }); return; }
    api.get("/api/admin/me").then(({ data }) => {
      if (!active) return;
      if (!data.admin?.mustChangePassword) navigate("/admin", { replace: true });
      else setReady(true);
    }).catch(() => { if (active) navigate("/admin/login", { replace: true }); });
    return () => { active = false; };
  }, [navigate]);
  const submit = async event => {
    event.preventDefault();
    setError("");
    if (form.newPassword !== form.repeat) { setError("New passwords do not match"); return; }
    if (new TextEncoder().encode(form.newPassword).length > 72) { setError("New password must be at most 72 UTF-8 bytes"); return; }
    setBusy(true);
    try {
      const { data } = await api.post("/api/admin/change-password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminData", JSON.stringify(data.admin));
      setForm({ currentPassword: "", newPassword: "", repeat: "" });
      window.dispatchEvent(new Event("authChanged"));
      navigate("/admin", { replace: true });
    } catch (failure) { setError(failure.response?.data?.message || "Password change failed. Please sign in again to check account status."); }
    finally { setBusy(false); }
  };
  return <main className="min-h-screen bg-white px-5 py-20 text-[#183D2B]">
    <div className="mx-auto max-w-md rounded-2xl border border-stone-200 p-7 shadow-lg">
      <h1 className="text-3xl font-bold">Set your admin password</h1>
      <p className="mt-4 text-sm leading-6">Replace your temporary password to unlock the dashboard. Use at least 12 characters and at most 72 UTF-8 bytes.</p>
      {!ready ? <p role="status" className="mt-6">Checking password-change access…</p> : <form onSubmit={submit} className="mt-6 space-y-5">
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {[["currentPassword", "Temporary password", "current-password"], ["newPassword", "New password", "new-password"], ["repeat", "Repeat new password", "new-password"]].map(([key, label, autoComplete]) => <label key={key} className="block text-sm font-semibold">{label}<input type="password" autoComplete={autoComplete} required minLength={key === "currentPassword" ? 1 : 12} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} className="mt-2 w-full rounded-xl border border-stone-300 p-3" /></label>)}
        <button disabled={busy} className="w-full rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? "Updating password…" : "Set password and open dashboard"}</button>
      </form>}
    </div>
  </main>;
}
