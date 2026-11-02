import { useEffect, useMemo, useState } from "react";
import { DEMO_GALLERY, GALLERY_CATEGORIES } from "../lib/galleryPhotos";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const normalizeCategory = (value = "") => {
  const category = value.toLowerCase();
  if (category.includes("visitor")) return "Visitor Moments";
  if (category.includes("cub") || category.includes("mother")) return "Mother & Cubs";
  if (category.includes("forest") || category.includes("habitat")) return "Forest Life";
  if (category.includes("moment") || category.includes("wildlife")) return "Wildlife Moments";
  return "Sloth Bears";
};

function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Photos");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [visitorUser, setVisitorUser] = useState(() => Boolean(localStorage.getItem("token")));
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadForm, setUploadForm] = useState({ displayName: "", title: "", description: "", location: "", consent: false, photo: null });
  const [preview, setPreview] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/api/gallery", { timeout: 6500 })
      .then(({ data }) => {
        const records = Array.isArray(data?.data) ? data.data : [];
        if (!active) return;
        if (records.length) {
          const storedPhotos = records.map((item, index) => ({
            ...item,
            id: item._id || `gallery-${index}`,
            image: item.image || item.imageUrl,
            category: item.category === "Visitor Moments" ? "Visitor Moments" : normalizeCategory(item.category),
            credit: item.credit || "Ratan Mahal Gallery",
            source: item.source || "",
          })).filter((item) => item.image);
          const contributedPhotos = storedPhotos.filter((item) => item.category === "Visitor Moments");
          const existingPhotos = storedPhotos.filter((item) => item.category !== "Visitor Moments");
          const uploadedPhotos = [...(existingPhotos.length ? existingPhotos : DEMO_GALLERY), ...contributedPhotos];
          if (uploadedPhotos.length) {
            setGalleryItems(uploadedPhotos);
            setIsDemo(existingPhotos.length === 0);
          } else {
            setGalleryItems(DEMO_GALLERY);
            setIsDemo(true);
          }
        } else {
          setGalleryItems(DEMO_GALLERY);
          setIsDemo(true);
        }
      })
      .catch(() => {
        if (!active) return;
        setGalleryItems(DEMO_GALLERY);
        setIsDemo(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const update = () => setVisitorUser(Boolean(localStorage.getItem("token")));
    window.addEventListener("authChanged", update);
    return () => window.removeEventListener("authChanged", update);
  }, []);
  useEffect(() => { if (!uploadForm.photo) { setPreview(""); return; } const url = URL.createObjectURL(uploadForm.photo); setPreview(url); return () => URL.revokeObjectURL(url); }, [uploadForm.photo]);

  const submitPhoto = async (event) => {
    event.preventDefault(); setUploadError(""); setUploadMessage("");
    if (!visitorUser) { navigate("/login", { state: { from: "/gallery" } }); return; }
    if (!uploadForm.photo || !uploadForm.consent) { setUploadError("Choose a photo and confirm you have permission to share it."); return; }
    const body = new FormData();
    Object.entries(uploadForm).forEach(([key, value]) => { if (key === "photo") body.append("photo", value); else body.append(key, value); });
    setUploading(true);
    try { await api.post("/api/gallery/visitor", body); setUploadMessage("Your photo has been submitted successfully and will appear in the Gallery after Admin approval."); setUploadForm({ displayName: "", title: "", description: "", location: "", consent: false, photo: null }); }
    catch (error) { setUploadError(error.response?.data?.message || "Photo upload failed. Please try again."); }
    finally { setUploading(false); }
  };

  const filteredImages = useMemo(() => activeCategory === "All Photos"
    ? galleryItems
    : galleryItems.filter((item) => normalizeCategory(item.category) === activeCategory), [activeCategory, galleryItems]);
  const selectedImage = selectedIndex === null ? null : filteredImages[selectedIndex];

  useEffect(() => {
    if (!selectedImage) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowRight") setSelectedIndex((index) => (index + 1) % filteredImages.length);
      if (event.key === "ArrowLeft") setSelectedIndex((index) => (index - 1 + filteredImages.length) % filteredImages.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredImages.length, selectedImage]);

  const showNeighbor = (offset) => setSelectedIndex((index) => (index + offset + filteredImages.length) % filteredImages.length);
  const fallbackImage = DEMO_GALLERY[0].image;

  return (
    <main className="min-h-screen bg-[#071b16] text-white">
      <section className="relative isolate flex min-h-[390px] items-end overflow-hidden md:min-h-[520px]">
        <img src={DEMO_GALLERY[0].image} alt="Indian sloth bear in its forest habitat" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" fetchPriority="high" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#061711] via-[#061711]/55 to-[#061711]/20" />
        <div className="photo-copy mx-auto w-full max-w-7xl px-5 pb-14 pt-28 md:pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300 md:text-sm">A wildlife photo collection</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-semibold leading-tight md:text-6xl">The Beauty of the <span className="text-emerald-300">Wild</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-200 md:text-lg">Explore the world of Indian sloth bears through portraits, family moments and forest scenes.</p>
          <a href="#gallery" className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/35 px-6 py-3 text-sm font-semibold transition hover:border-emerald-300 hover:bg-emerald-300 hover:text-[#10251b]">Explore the collection <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section id="gallery" style={{ backgroundColor: "#f3f5ef", color: "#12271d" }} className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col gap-7 border-b border-[#dce4da] pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">Ratan Mahal Wildlife Sanctuary</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Moments in the wild</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#536257]">A closer look at sloth bears and the landscapes they call home.</p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Filter gallery by category">
              {GALLERY_CATEGORIES.map((category) => <button key={category} type="button" onClick={() => { setActiveCategory(category); setSelectedIndex(null); }} style={{ color: activeCategory === category ? "#ffffff" : "#35483a", backgroundColor: activeCategory === category ? "#173d2d" : "#ffffff" }} className="rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:brightness-95">{category}</button>)}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce4da] bg-white p-5 shadow-sm">
            <div><h3 className="font-semibold text-[#183D2B]">Share your wildlife moments</h3><p className="mt-1 text-sm text-[#536257]">Visitor submissions appear after admin review.</p></div>
            <button type="button" onClick={() => visitorUser ? setUploadOpen((open) => !open) : navigate("/login", { state: { from: "/gallery" } })} className="rounded-full bg-[#245C3B] px-5 py-3 text-sm font-bold text-white hover:bg-[#347A50]">📸 Share Your Wildlife Moments</button>
          </div>

          {isDemo && <p className="mt-6 text-xs text-[#637267]">Showing a curated collection while sanctuary gallery uploads are unavailable.</p>}
          {loading ? <div className="py-20 text-center text-[#47624f]" role="status">Loading photographs…</div> : (
            <>
              <p className="mt-6 text-sm text-[#637267]">{filteredImages.length} photographs</p>
              <div className="mt-5 grid auto-rows-[210px] grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[235px] lg:grid-cols-3 xl:grid-cols-4">
                {filteredImages.map((item, index) => <button key={item.id} type="button" onClick={() => setSelectedIndex(index)} className={`group relative overflow-hidden rounded-2xl bg-[#dce4da] text-left shadow-sm outline-none ring-emerald-600 focus-visible:ring-4 ${index % 7 === 0 ? "sm:row-span-2 lg:col-span-2" : ""}`} aria-label={`Open photograph: ${item.title}`}>
                  <img src={item.image} alt={item.title || "Indian sloth bear"} loading={index === 0 ? "eager" : "lazy"} decoding="async" onError={(event) => { if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage; }} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/0 opacity-80 transition group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">{item.category}</span>
                    <h3 className="mt-2 font-serif text-xl font-semibold leading-snug">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-white/75">{item.description}</p>
                  </div>
                  <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-black/25 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100" aria-hidden="true">↗</span>
                </button>)}
              </div>
            </>
          )}
          <p className="mt-10 border-t border-[#dce4da] pt-5 text-xs leading-5 text-[#637267]">Photographs are credited to their creators. Stock and Commons images are illustrative and are not represented as photographs taken at Ratan Mahal.</p>
          <details className="mt-3 text-xs text-[#637267]">
            <summary className="w-fit cursor-pointer font-semibold underline underline-offset-4">Photo credits and licenses</summary>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {DEMO_GALLERY.map((photo) => <li key={photo.id}><a href={photo.source} target="_blank" rel="noreferrer" className="underline underline-offset-2">{photo.credit}</a> — {photo.license}</li>)}
            </ul>
          </details>
        </div>
      </section>

      {uploadOpen && <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="upload-title" onClick={() => setUploadOpen(false)}><form onSubmit={submitPhoto} onClick={(event) => event.stopPropagation()} className="my-8 w-full max-w-xl rounded-3xl bg-white p-6 text-[#183D2B] shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Visitor Moments</p><h2 id="upload-title" className="mt-2 text-2xl font-bold">Share a wildlife photograph</h2></div><button type="button" onClick={() => setUploadOpen(false)} aria-label="Close form" className="text-2xl">×</button></div>
        {uploadMessage && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{uploadMessage}</p>}{uploadError && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{uploadError}</p>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Your display name<input required maxLength="80" value={uploadForm.displayName} onChange={(e) => setUploadForm({ ...uploadForm, displayName: e.target.value })} className="mt-2 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold">Photo title<input required maxLength="120" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} className="mt-2 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold sm:col-span-2">Description (optional)<textarea maxLength="500" value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} className="mt-2 w-full rounded-xl border p-3" rows="3" /></label><label className="text-sm font-semibold sm:col-span-2">Location (optional)<input maxLength="120" value={uploadForm.location} onChange={(e) => setUploadForm({ ...uploadForm, location: e.target.value })} className="mt-2 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold sm:col-span-2">Photo (JPG, PNG or WebP, up to 5 MB)<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setUploadForm({ ...uploadForm, photo: e.target.files?.[0] || null })} className="mt-2 w-full rounded-xl border p-3" /></label></div>
        {preview && <img src={preview} alt="Selected photo preview" className="mt-4 max-h-64 w-full rounded-xl object-contain bg-stone-100" />}
        <label className="mt-5 flex gap-3 text-sm"><input type="checkbox" checked={uploadForm.consent} onChange={(e) => setUploadForm({ ...uploadForm, consent: e.target.checked })} required /><span>I confirm that I own this photograph or have permission to share it publicly.</span></label><button disabled={uploading} className="mt-5 w-full rounded-full bg-[#245C3B] px-5 py-3 font-bold text-white disabled:opacity-60">{uploading ? "Submitting…" : "Submit for Admin Approval"}</button>
      </form></div>}

      {selectedImage && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedIndex(null)} role="dialog" aria-modal="true" aria-label={`Photo viewer: ${selectedImage.title}`}>
        <button type="button" onClick={() => showNeighbor(-1)} className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-2xl text-white backdrop-blur hover:bg-white/30 sm:left-6" aria-label="Previous photo">‹</button>
        <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => setSelectedIndex(null)} className="absolute -top-12 right-0 rounded-full px-4 py-2 text-white hover:bg-white/15" aria-label="Close photo viewer">Close ×</button>
          <img src={selectedImage.image} alt={selectedImage.title || "Indian sloth bear"} onError={(event) => { if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage; }} className="max-h-[72vh] w-full rounded-xl object-contain" />
          <div className="mt-3 flex flex-col gap-3 rounded-xl bg-[#10251b] p-4 text-white sm:flex-row sm:items-end sm:justify-between sm:p-5">
            <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">{selectedImage.category}</p><h3 className="mt-1 font-serif text-xl font-semibold">{selectedImage.title}</h3><p className="mt-1 text-sm text-white/75">{selectedImage.description}</p></div>
            <a href={selectedImage.source || "https://commons.wikimedia.org/"} target="_blank" rel="noreferrer" className="shrink-0 text-xs text-emerald-200 underline underline-offset-4">Photo: {selectedImage.credit}{selectedImage.license ? ` · ${selectedImage.license}` : ""}</a>
          </div>
        </div>
        <button type="button" onClick={() => showNeighbor(1)} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-2xl text-white backdrop-blur hover:bg-white/30 sm:right-6" aria-label="Next photo">›</button>
      </div>}
    </main>
  );
}

export default Gallery;
