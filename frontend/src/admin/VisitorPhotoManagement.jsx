import SiteImage from "../components/SiteImage";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function VisitorPhotoManagement() {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState({});
  useEffect(() => {
    let active = true;
    const urls = [];
    const load = async () => {
      try {
        const { data } = await api.get("/api/gallery/visitor/admin/pending");
        const items = data.data || [];
        if (!active) return;
        setPhotos(items);
        const entries = await Promise.all(items.map(async (photo) => {
          const response = await api.get(`/api/gallery/visitor/admin/${photo._id}/image`, { responseType: "blob" });
          if (!active) return null;
          const url = URL.createObjectURL(response.data);
          urls.push(url);
          return [photo._id, url];
        }));
        if (active) setPreviews(Object.fromEntries(entries.filter(Boolean)));
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || "Could not load visitor submissions.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);
  const moderate = async (photo, action) => {
    setMessage(""); setError("");
    try {
      if (action === "delete") await api.delete(`/api/gallery/visitor/admin/${photo._id}`);
      else await api.patch(`/api/gallery/visitor/admin/${photo._id}/status`, { status: action });
      setPhotos((items) => items.filter((item) => item._id !== photo._id)); setMessage(action === "approved" ? "Photo approved and added to the public Gallery." : action === "rejected" ? "Photo rejected." : "Photo deleted.");
    } catch (requestError) { console.error("Photo moderation failed", requestError); setError(requestError.response?.data?.message || "Could not update the photo."); }
  };
  return <main className="min-h-screen bg-[#061a17] px-5 py-12 text-white"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Ratan Mahal Admin</p><h1 className="mt-2 text-3xl font-bold">Visitor Photo Management</h1><p className="mt-2 text-sm text-gray-300">Review submissions before they appear in the public Gallery.</p></div><Link to="/admin" className="rounded-xl border border-white/30 px-4 py-3 text-sm font-bold">Back to Dashboard</Link></div>
  {message && <p role="status" className="mt-6 rounded-xl bg-emerald-900/60 p-4 text-emerald-100">{message}</p>}{error && <p role="alert" className="mt-6 rounded-xl bg-red-950/60 p-4 text-red-100">{error}</p>}
  {loading ? <p className="py-16 text-center">Loading submissions…</p> : photos.length === 0 ? <p className="mt-8 rounded-2xl bg-white p-8 text-center text-[#183D2B]">No pending visitor photo submissions.</p> : <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo) => <article key={photo._id} className="overflow-hidden rounded-2xl bg-white text-[#183D2B] shadow-xl"><SiteImage src={previews[photo._id]} alt={`Submission: ${photo.title}`} className="aspect-[4/3] w-full bg-stone-100 object-cover" /><div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Pending review</p><h2 className="mt-2 text-lg font-bold">{photo.title}</h2><p className="mt-1 text-sm">By {photo.displayName}{photo.location ? ` · ${photo.location}` : ""}</p>{photo.description && <p className="mt-3 text-sm text-stone-600">{photo.description}</p>}<div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => moderate(photo, "approved")} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Approve</button><button type="button" onClick={() => moderate(photo, "rejected")} className="rounded-lg border border-amber-600 px-4 py-2 text-sm font-bold text-amber-800">Reject</button><button type="button" onClick={() => moderate(photo, "delete")} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700">Delete</button></div></div></article>)}</div>}</div></main>;
}
