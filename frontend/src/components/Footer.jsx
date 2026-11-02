import { Link } from "react-router-dom";
import { DEMO_GALLERY } from "../lib/galleryPhotos";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E3EAE4] bg-[#F7F9F6]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-3 md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">🐻</span>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#183D2B]">Ratan Mahal</h2>
              <p className="text-xs text-[#245C3B]">Wildlife Sanctuary</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#536257]">Protecting bears, preserving forests, and sharing the story of wildlife conservation.</p>
          <p className="mt-3 max-w-sm text-xs leading-5 text-[#536257]">Website photography is illustrative stock, not a record of photographs taken at Ratan Mahal.</p>
        </div>

        <div>
          <h3 className="font-semibold text-[#183D2B]">Explore</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#536257]">
            <Link to="/about" className="transition hover:text-[#245C3B]">About Sanctuary</Link>
            <Link to="/posts" className="transition hover:text-[#245C3B]">Latest Posts</Link>
            <Link to="/gallery" className="transition hover:text-[#245C3B]">Photo Gallery</Link>
            <Link to="/videos" className="transition hover:text-[#245C3B]">Bear Videos</Link>
            <Link to="/stay" className="transition hover:text-[#245C3B]">Hotel &amp; Rest House</Link>
            <Link to="/contact" className="transition hover:text-[#245C3B]">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-[#183D2B]">Contact</h3>
          <div className="mt-4 space-y-4 text-sm text-[#536257]">
            <p>📍 Ratan Mahal Wildlife Sanctuary, Gujarat, India</p>
            <p>✉️ <a href="mailto:yashrajpuvar442@gmail.com" className="transition hover:text-emerald-300">yashrajpuvar442@gmail.com</a></p>
            <p>📞 <a href="tel:+919510109200" className="transition hover:text-emerald-300">+91 9510109200</a></p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E3EAE4] px-5 py-5 text-center text-xs text-[#536257]">
        <p>© {currentYear} Ratan Mahal Wildlife Sanctuary. All rights reserved.</p>
        <p className="mt-2">Designed &amp; Developed by <Link to="/developer" className="font-semibold text-emerald-300 transition hover:text-emerald-200">Yashraj Puvar</Link></p>
        <a href="https://www.linkedin.com/in/yashraj-puvar-412a43362/" target="_blank" rel="noopener noreferrer" aria-label="Connect with Yashraj Puvar on LinkedIn (opens in a new tab)" className="mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-emerald-800/20 bg-emerald-50 px-4 py-2 font-semibold text-emerald-900 transition hover:border-emerald-800/40 hover:bg-emerald-100 hover:text-emerald-950"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 10H5.67v8h2.67v-8Zm7.02-.19c-1.28 0-2.15.7-2.5 1.36V10h-2.67v8h2.67v-4.23c0-1.11.21-2.19 1.59-2.19 1.36 0 1.38 1.27 1.38 2.26V18h2.67v-4.69c0-2.31-.5-3.5-3.14-3.5ZM7 6.13a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1Z" /></svg>Connect on LinkedIn ↗</a>
        <details className="mx-auto mt-3 max-w-5xl text-left leading-6">
          <summary className="cursor-pointer text-center underline decoration-white/30 underline-offset-2 hover:text-emerald-300">Photograph credits and licenses</summary>
          <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {DEMO_GALLERY.map((photo) => <li key={photo.id}><a href={photo.source} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-emerald-300">{photo.credit}</a> — {photo.license}</li>)}
          </ul>
          <p className="mt-3">Illustrative wildlife images; these photos were taken at the locations named on their source pages, not at Ratan Mahal.</p>
        </details>
      </div>
    </footer>
  );
}

export default Footer;
