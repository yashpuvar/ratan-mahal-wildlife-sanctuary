import SiteImage from "../components/SiteImage";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import api from "../lib/api";
import { getBearPhoto } from "../lib/bearPhotos";
import { WILDLIFE_VIDEOS } from "../lib/wildlifeVideos";
import YouTubePlayer from "../components/YouTubePlayer";

const demoVideos = [
  {
    id: "pexels-sloth-bears-exploring-35364740",
    title: "Sloth Bears Exploring Their Habitat",
    description: "Sloth bears explore and interact in a zoo habitat. This free stock clip is illustrative and was not recorded at Ratan Mahal.",
    poster: "/images/bears/sloth-bears-exploring.jpg",
    playableUrl: "https://videos.pexels.com/video-files/35364740/14983920_3840_2160_30fps.mp4",
    source: "https://www.pexels.com/video/sloth-bears-in-a-zoo-enclosure-exploring-35364740/",
    credit: "Sanjay Sharma · Pexels",
    duration: "0:15",
  },
  {
    id: "pexels-sloth-bears-foraging-35364739",
    title: "Sloth Bears Foraging Outdoors",
    description: "Three sloth bears explore and forage in an outdoor zoo habitat. Stock footage, not a Ratan Mahal recording.",
    poster: "/images/bears/sloth-bears-foraging.jpg",
    playableUrl: "https://videos.pexels.com/video-files/35364739/14983902_2160_3840_30fps.mp4",
    source: "https://www.pexels.com/video/sloth-bears-foraging-in-outdoor-enclosure-35364739/",
    credit: "Sanjay Sharma · Pexels",
  },
  {
    id: "pexels-sloth-bear-observing-36767649",
    title: "A Sloth Bear Observes Its Surroundings",
    description: "A sloth bear explores an outdoor zoo enclosure on a sunny day. Stock footage, not a Ratan Mahal recording.",
    poster: "/images/bears/sloth-bear-observing.jpg",
    playableUrl: "https://videos.pexels.com/video-files/36767649/15581710_1920_1080_25fps.mp4",
    source: "https://www.pexels.com/video/sloth-bear-observing-its-surroundings-in-zoo-habitat-36767649/",
    credit: "Sound Designer S.K Pramanik · Pexels",
    duration: "0:21",
  },
  {
    id: "pexels-sloth-bears-resting-35364742",
    title: "Sloth Bears at Rest",
    description: "Sloth bears explore and relax in an enclosure. The source identifies this as zoo habitat footage.",
    poster: "/images/bears/sloth-bears-resting.jpg",
    playableUrl: "https://videos.pexels.com/video-files/35364742/14983908_2160_3840_30fps.mp4",
    source: "https://www.pexels.com/video/sloth-bears-in-their-natural-habitat-35364742/",
    credit: "Sanjay Sharma · Pexels",
  },
];

function VideoCard({ video, onPlay }) {
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
  const demo = Boolean(video.source);
  const poster = demo
    ? video.poster
    : video.thumbnail || getBearPhoto(video.posterIndex || 0).src;
  const title = video.title || "Sloth Bear Documentary";

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0a211b] shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-2xl">
      <button
        type="button"
        onClick={(event) => onPlay(video, event.currentTarget)}
        aria-label={`Play ${title}`}
        className="relative block aspect-video w-full overflow-hidden bg-black text-left"
      >
        {thumbnailLoading && <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-emerald-950" />}
        <SiteImage
          src={poster}
          alt={`Video thumbnail: ${title}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setThumbnailLoading(false)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"

        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 transition group-hover:from-black/65" />
        <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/35 text-xl text-white shadow-lg backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-emerald-600">
          <span className="ml-1" aria-hidden="true">▶</span>
        </span>
        {demo && video.duration && (
          <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white">
            {video.duration}
          </span>
        )}
      </button>

      <div className="p-5 sm:p-6">
        {video.location && <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">{video.category} · {video.location}</p>}
        <h3 className="text-lg font-bold leading-snug text-white sm:text-xl">{title}</h3>
        {video.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-300">{video.description}</p>
        )}
        {demo && <a href={video.source} target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-900">{video.credit} · Original video ↗</a>}
      </div>
    </article>
  );
}

function Videos() {
  const [videos, setVideos] = useState([]);
  const [usingDemoCollection, setUsingDemoCollection] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [playerFailed, setPlayerFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const closeButton = useRef(null);
  const playerOpener = useRef(null);

  useEffect(() => {
    if (!selectedVideo) return;
    const opener = playerOpener.current || document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedVideo(null);
      if (event.key === "Tab") {
        const controls = closeButton.current?.parentElement.querySelectorAll('button, a[href], iframe, video[controls]');
        const first = controls?.[0];
        const last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", onKeyDown); opener?.focus(); };
  }, [selectedVideo]);

  useEffect(() => {
    let active = true;

    const loadVideos = async () => {
      try {
        const response = await api.get("/api/videos", { timeout: 5000 });
        const records = response.data?.data;
        const publishedVideos = Array.isArray(records) ? records : [];

        if (active) {
          setVideos(publishedVideos);
          setUsingDemoCollection(publishedVideos.length === 0);
        }
      } catch {
        if (active) {
          setVideos([]);
          setUsingDemoCollection(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadVideos();
    return () => {
      active = false;
    };
  }, []);

  const playVideo = (video, trigger) => {
    playerOpener.current = trigger || document.activeElement;
    setPlayerFailed(false);
    setSelectedVideo(video);
  };

  const databaseVideos = videos.map((video, index) => ({
    ...video,
    posterIndex: index % 7,
  }));
  const categories = ["All", ...new Set(videos.map((video) => video.category || "Wildlife"))];
  const filteredDatabaseVideos = activeCategory === "All"
    ? databaseVideos
    : databaseVideos.filter((video) => (video.category || "Wildlife") === activeCategory);
  const featuredVideo = usingDemoCollection ? demoVideos[0] : filteredDatabaseVideos[0];
  const gridVideos = usingDemoCollection
    ? demoVideos.slice(1)
    : filteredDatabaseVideos.slice(1);

  return (
    <main className="min-h-screen bg-[#04130f] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <SiteImage
          src={getBearPhoto(5).src}
          alt="Indian sloth bear in a forest habitat"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#03110e]/95 via-[#03110e]/75 to-[#03110e]/35" />
        <div className="photo-copy mx-auto max-w-7xl px-5 py-20 sm:py-28 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">Wildlife Stories · Sloth Bears</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Stories From <span className="text-emerald-300">The Wild</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-200 sm:text-lg">
            Watch Indian sloth bears explore, forage and move through their habitats. Each film is credited to its source; stock footage is not represented as a Ratan Mahal recording.
          </p>
        </div>
      </section>

      <section aria-labelledby="wildlife-films-title" className="mx-auto max-w-7xl px-5 pt-14 sm:pt-16 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Field notes · Indian wildlife</p>
          <h2 id="wildlife-films-title" className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Small Moments. Wild Lives.</h2>
          <p className="mt-4 text-sm leading-7 text-gray-300">Four windows into the world of the Indian sloth bear, from forest trails to family life. Filmed elsewhere in India; these are not recordings from Ratan Mahal.</p>
          <p className="mt-3 text-xs leading-6 text-gray-400">Thumbnails load from YouTube. The privacy-enhanced player loads only when you choose a film. Press play in the player to begin.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {WILDLIFE_VIDEOS.map(video => <VideoCard key={video.id} video={video} onPlay={playVideo} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:py-16 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              {usingDemoCollection ? "Curated wildlife films" : "Sanctuary collection"}
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Discover the Secret Life of Sloth Bears</h2>
          </div>
        </div>

        {!loading && !usingDemoCollection && categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2" aria-label="Filter videos by category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCategory === category ? "border-emerald-400 bg-emerald-500 text-[#04130f]" : "border-white/15 bg-white/5 text-gray-200 hover:border-emerald-300/50 hover:bg-white/10"}`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2" aria-label="Loading wildlife videos">
            <div className="aspect-video animate-pulse rounded-2xl bg-white/10" />
            <div className="space-y-4 py-4">
              <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-20 w-full animate-pulse rounded bg-white/10" />
            </div>
          </div>
        ) : featuredVideo ? (
          <>
            <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-[#0a211b] shadow-2xl shadow-black/25 lg:grid-cols-[1.25fr_0.75fr]">
              {usingDemoCollection ? (
                <button
                  type="button"
                  onClick={(event) => playVideo(featuredVideo, event.currentTarget)}
                  aria-label={`Play ${featuredVideo.title}`}
                  className="group relative block aspect-video overflow-hidden bg-black text-left lg:aspect-auto lg:min-h-[390px]"
                >
                <SiteImage
                  src={featuredVideo.poster}
                  alt={`Video thumbnail: ${featuredVideo.title}`}
                  fetchPriority="high"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"

                />
                  <span className="absolute inset-0 bg-black/15 transition group-hover:bg-black/30" />
                  <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/35 text-2xl text-white shadow-xl backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-emerald-600">
                    <span className="ml-1" aria-hidden="true">▶</span>
                  </span>
                </button>
              ) : (
                <button type="button" onClick={(event) => playVideo(featuredVideo, event.currentTarget)} aria-label={`Play ${featuredVideo.title}`} className="group relative block aspect-video overflow-hidden bg-black text-left lg:aspect-auto lg:min-h-[390px]">
                  <SiteImage src={featuredVideo.thumbnail || getBearPhoto(featuredVideo.posterIndex).src} alt={`Indian sloth bear video thumbnail: ${featuredVideo.title}`} fetchPriority="high" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/35" />
                  <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/35 text-2xl text-white shadow-xl backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-emerald-600"><span className="ml-1" aria-hidden="true">▶</span></span>
                </button>
              )}
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Featured film</p>
                <h3 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{featuredVideo.title}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-300">{featuredVideo.description || "Watch a featured sloth bear wildlife film."}</p>
                {usingDemoCollection ? (
                  <p className="mt-5 text-xs font-medium text-emerald-200/80">{featuredVideo.credit} · Pexels stock footage</p>
                ) : (
                  <button type="button" onClick={(event) => playVideo(featuredVideo, event.currentTarget)} className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold transition hover:bg-emerald-500">
                    Watch film <span aria-hidden="true">▶</span>
                  </button>
                )}
              </div>
            </div>

            {gridVideos.length > 0 && (
              <div className="mt-12">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">More films</p>
                    <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Sloth Bear Stories</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {gridVideos.map((video) => (
                    <VideoCard key={video.id || video._id} video={video} onPlay={playVideo} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : videos.length > 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0a211b] p-8 text-gray-300">
            <p>No films are listed in this category.</p>
            <button type="button" onClick={() => setActiveCategory("All")} className="mt-3 text-sm font-bold text-emerald-300 hover:text-emerald-200">Show all videos</button>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0a211b] p-8 text-gray-300">
            Wildlife videos are not available right now. Please try again later.
          </div>
        )}
      </section>

      <section className="border-t border-white/10 bg-[#03100d]">
        <div className="mx-auto max-w-7xl px-5 py-6 text-xs leading-5 text-gray-400 lg:px-8">
          Stock footage credit: {demoVideos.map((video, index) => (
            <span key={video.id}>
              {index > 0 && " · "}
              <a href={video.source} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-emerald-300">{video.credit}</a>
            </span>
          ))}. Pexels stock clips show sloth bears in zoo or outdoor enclosures; they are not footage from Ratan Mahal.
        </div>
      </section>

      {selectedVideo && createPortal(
        <div role="dialog" aria-modal="true" aria-label={`Video player: ${selectedVideo.title || "Sloth bear video"}`} className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/90 p-4" onClick={() => setSelectedVideo(null)}>
          <div className="relative my-auto max-h-[95dvh] w-full max-w-5xl overflow-y-auto pt-12" onClick={(event) => event.stopPropagation()}>
            <button ref={closeButton} type="button" onClick={() => setSelectedVideo(null)} className="absolute right-0 top-0 rounded-full bg-white px-4 py-2 text-lg font-bold text-[#061a17] transition hover:bg-emerald-300" aria-label="Close video">✕</button>
            <div className="aspect-video min-h-[200px] w-full overflow-hidden rounded-xl bg-black">
              {playerFailed ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
                  <p>This video could not be played here.</p>
                  <a href={selectedVideo.source || `https://www.youtube.com/watch?v=${encodeURIComponent(selectedVideo.youtubeId || "")}`} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold hover:bg-emerald-500">Open original video</a>
                </div>
              ) : selectedVideo.playableUrl ? (
                <video
                  key={selectedVideo.playableUrl}
                  className="h-full w-full"
                  src={selectedVideo.playableUrl}
                  poster={selectedVideo.poster}
                  controls
                  playsInline
                  preload="none"
                  onError={() => setPlayerFailed(true)}

                />
              ) : (
                <YouTubePlayer key={selectedVideo.youtubeId} videoId={selectedVideo.youtubeId || ""} title={selectedVideo.title || "Sloth bear wildlife video"} />
              )}
            </div>
            <div className="mt-3 rounded-xl border border-[#E3EAE4] bg-white p-5 text-center">
              <h3 className="text-xl font-bold text-[#183D2B]">{selectedVideo.title}</h3>
              {selectedVideo.description && <p className="mt-2 text-sm leading-6 text-[#536257]">{selectedVideo.description}</p>}
              <a href={selectedVideo.source || `https://www.youtube.com/watch?v=${encodeURIComponent(selectedVideo.youtubeId || "")}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-emerald-800 underline underline-offset-4">{selectedVideo.credit ? `${selectedVideo.credit} · ` : ""}Watch original video ↗</a>
            </div>
          </div>
        </div>, document.body
      )}
    </main>
  );
}

export default Videos;
