import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { getBearPhoto } from "../lib/bearPhotos";
import { SanctuaryStatusPanel } from "../components/SanctuaryStatus";

const defaultPosts = [
  {
    _id: "demo1",
    title: "Meet the Indian Sloth Bear",
    description: "An introduction to the distinctive bear species and the forests it inhabits.",
    category: "Wildlife Education",
    createdAt: new Date().toISOString(),
    image: getBearPhoto(1).src,
  },
  {
    _id: "demo2",
    title: "A Bear’s Path Through the Forest",
    description: "Explore the forest landscapes that shape a sloth bear’s daily life.",
    category: "Forest Life",
    createdAt: new Date().toISOString(),
    image: getBearPhoto(2).src,
  },
  {
    _id: "demo3",
    title: "How Sloth Bears Search for Food",
    description: "Learn about the feeding adaptations behind the sloth bear’s long snout and claws.",
    category: "Bear Behaviour",
    createdAt: new Date().toISOString(),
    image: getBearPhoto(3).src,
  },
];

const galleryShowcase = [
  {
    title: "Sloth Bear on a Forest Walk",
    tag: "Sloth Bears",
    image: getBearPhoto(0).src,
  },
  {
    title: "Mother Bear and Cubs",
    tag: "Family",
    image: getBearPhoto(2).src,
  },
  {
    title: "Searching for Forest Food",
    tag: "Foraging",
    image: getBearPhoto(1).src,
  },
  {
    title: "Sloth Bear in the Teak Forest",
    tag: "Habitat",
    image: getBearPhoto(3).src,
  },
  {
    title: "A Bear Along the Forest Path",
    tag: "Forest Trail",
    image: getBearPhoto(4).src,
  },
  {
    title: "A Sloth Bear in Its Natural Home",
    tag: "Habitat",
    image: getBearPhoto(5).src,
  },
];

function Home() {
  const [latestPosts, setLatestPosts] = useState([]);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setViewCount(count);
      if (count >= 4) window.clearInterval(timer);
    }, 110);
    return () => window.clearInterval(timer);
  }, []);
  // const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        const response = await api.get("/api/posts");
        if (response.data.data && response.data.data.length > 0) {
          setLatestPosts(response.data.data.slice(0, 3));
        } else {
          setLatestPosts(defaultPosts);
        }
      } catch (err) {
        console.error("Could not fetch home posts:", err);
        setLatestPosts(defaultPosts);
      } finally {
        // setLoadingPosts(false);
      }
    };

    fetchLatestPosts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="bg-[#020d0a] text-white">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative flex min-h-[92vh] flex-col justify-between overflow-hidden bg-[#020d0a]">
        {/* Background Image with Slow Motion Ken-Burns Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={getBearPhoto(0).src}
            alt="Sloth Bear in Ratan Mahal"
            className="h-full w-full object-cover object-center animate-cinematic"
          />
        </div>

        {/* Cinematic Vignette Overlay */}
        <div className="cinematic-vignette absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020d0a] via-transparent to-[#020d0a]/70" />

        {/* Hero Content */}
        <div className="photo-copy relative mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-28">
          <div className="max-w-3xl">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-4 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                Gujarat's Premier Bear Sanctuary
              </p>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
              Ratan Mahal
              <span className="block bg-gradient-to-r from-emerald-400 via-green-300 to-teal-200 bg-clip-text text-transparent">
                Wildlife Sanctuary
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 backdrop-blur-[1px]">
              Step into the dense deciduous forests of Dahod. Home to the elusive sloth bears, pristine mountain streams, and the timeless wilderness of the Malgaddi hills.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/about"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-950/50 transition duration-300 hover:from-emerald-400 hover:to-green-500 hover:shadow-emerald-600/30"
              >
                <span>Explore Sanctuary</span>
                <span className="transition duration-300 group-hover:translate-x-1">→</span>
              </Link>

              <Link
                to="/videos"
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-black/30 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition duration-300 hover:bg-white/10 hover:border-white/40"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
                  ▶
                </span>
                <span>Watch Wildlife Reel</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Glass Stats Bar */}
        <div className="photo-copy relative border-t border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-6 md:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl">🐾</span>
              <div>
                <p className="text-base font-bold text-white">Sloth Bears</p>
                <p className="text-xs text-emerald-400">Prime Protected Habitat</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="text-3xl">🌲</span>
              <div>
                <p className="text-base font-bold text-white">55.65 sq km</p>
                <p className="text-xs text-emerald-400">Dense Forest Reserve</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="text-3xl">🐻</span>
              <div>
                <p className="text-base font-bold text-white">Indian Sloth Bears</p>
                <p className="text-xs text-emerald-400">Our Conservation Focus</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="text-3xl">🏡</span>
              <div>
                <p className="text-base font-bold text-white">Forest Stay</p>
                <p className="text-xs text-emerald-400">Hotel & Rest House</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F7F9F6] px-5 py-10 sm:px-8" aria-label="Illustrative website views">
        <div className="mx-auto flex max-w-7xl items-center gap-5 rounded-2xl border border-[#E3EAE4] bg-white px-6 py-5 shadow-sm sm:px-8">
          <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#E8F4EC] text-[#287A4B]"><svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/></svg></span>
          <div><p className="text-3xl font-extrabold tracking-tight text-[#183D2B] sm:text-4xl" aria-label="4 Lakh plus illustrative views">{viewCount} Lakh+</p><p className="mt-1 text-sm font-semibold text-[#287A4B]">Illustrative Views</p><p className="mt-1 text-xs text-[#59655c]">Promotional display figure; not measured website traffic.</p></div>
        </div>
      </section>

      <div className="bg-[#061a17] px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-7xl"><SanctuaryStatusPanel /></div>
      </div>

      {/* 2. LATEST DISPATCHES & STORIES (DYNAMIC MONGODB POSTS) */}
      <section className="relative border-t border-white/5 bg-[#03140f] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Wild Chronicles
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
                Latest Dispatches & Stories
              </h2>
            </div>
            <Link
              to="/posts"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 transition hover:text-emerald-300"
            >
              <span>View All Posts</span>
              <span>→</span>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="mt-12 grid gap-7 md:grid-cols-3">
            {latestPosts.map((post, index) => (
              <article
                key={post._id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#061e17] transition duration-500 hover:-translate-y-2 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-950/60"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image || getBearPhoto(index).src}
                    alt={post.image?.startsWith("/images/posts/") ? "Forest-covered hills fading into a soft blue haze" : `Illustrative wildlife image for ${post.title}`}
                    loading="lazy"
                    onError={(event) => { event.currentTarget.src = getBearPhoto(index).src; }}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061e17] via-transparent to-transparent opacity-80" />
                  <span className="absolute left-4 top-4 rounded-full border border-emerald-400/30 bg-black/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
                    {post.category || "Sanctuary"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-medium text-gray-400">
                    {formatDate(post.createdAt)}
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-white transition group-hover:text-emerald-300">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-300">
              {post.description || "Read more about sloth bears, forest habitats and conservation."}
                  </p>

                  <div className="mt-auto pt-6">
                    <Link
                      to="/posts"
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300"
                    >
                      Read Dispatch <span>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CINEMATIC GALLERY PREVIEW */}
      <section className="relative border-t border-white/5 bg-[#020d0a] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Visual Archive
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
                Moments From The Sanctuary
              </h2>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 transition hover:text-emerald-300"
            >
              <span>Explore Full Gallery</span>
              <span>→</span>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {galleryShowcase.map((item, idx) => (
              <Link
                key={idx}
                to="/gallery"
                className="group relative h-48 overflow-hidden rounded-xl border border-white/10 md:h-64"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {item.tag}
                  </p>
                  <p className="truncate text-xs font-bold text-white">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Wildlife stories */}
      <section className="border-t border-white/5 bg-[#03140f] py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Wildlife stories</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-white md:text-4xl">Life in the Forest</h2>
            <p className="mt-4 max-w-xl leading-7 text-gray-300">
              Explore photographs and short films about Indian sloth bears and their forest habitats. Licensed stock media is illustrative and was not captured at Ratan Mahal.
            </p>
            <Link to="/videos" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500">
              Explore bear documentaries <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[0, 2, 1, 4].map((photoIndex, index) => {
              const photo = getBearPhoto(photoIndex);
              return (
                <figure key={photo.id} className={`group relative overflow-hidden rounded-2xl ${index === 0 || index === 3 ? "h-48 sm:h-56" : "mt-6 h-48 sm:h-56"}`}>
                  <img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-xs font-semibold text-white">{photo.alt}</figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stay spotlight */}
      <section className="relative overflow-hidden border-t border-[#E3EAE4] bg-white py-20 text-[#333333] md:py-24">
        <div className="absolute inset-0">
          <img
            src="/images/hotel/wooden-cottage.jpg"
            alt="Illustrative forest cottage in a green landscape"
            loading="lazy"
            className="h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/88 to-white/72" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E3EAE4] bg-white/90 px-4 py-1.5 shadow-sm">
                <span className="text-sm">🏡</span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#287A4B]">
                  Sanctuary Hospitality
                </span>
              </div>

              <h2 className="mt-6 font-serif text-4xl font-semibold text-[#183D2B] md:text-5xl">
                Stay Close to Nature
              </h2>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#333333]">
                Experience the Peace of the Forest. Choose a stay enquiry type and ask the team to confirm current room details, rates and availability. This stock accommodation image is illustrative and does not depict the sanctuary property.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/stay"
                  className="rounded-xl bg-[#245C3B] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#183D2B]/15 transition duration-300 hover:bg-[#347A50]"
                >
                  Explore Our Stay
                </Link>
                <Link
                  to="/contact"
                  className="rounded-xl border border-[#245C3B] bg-white px-6 py-3.5 text-sm font-bold text-[#245C3B] transition hover:bg-[#F7F9F6]"
                >
                  Ask a question
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { type: "Hotel Room", image: "/images/hotel/premium-bedroom.jpg" },
                { type: "Rest House", image: "/images/hotel/wooden-cottage.jpg" },
              ].map((option) => <Link key={option.type} to="/stay" className="group relative min-h-48 overflow-hidden rounded-2xl border border-[#E3EAE4] bg-white shadow-lg shadow-[#183D2B]/[0.08]">
                <img src={option.image} alt={`Illustrative stock photo for ${option.type}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-white/95 p-5 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#287A4B]">Enquiry option</p>
                  <h3 className="mt-1 text-lg font-bold text-[#183D2B]">{option.type}</h3>
                  <p className="mt-1 text-xs text-[#536257]">Illustrative accommodation image</p>
                </div>
              </Link>)}
              <div className="rounded-2xl border border-[#E3EAE4] bg-[#F7F9F6] p-5 sm:col-span-2">
                <p className="text-sm leading-6 text-[#333333]">Group Booking is also accepted as an enquiry type. For all requests, the team will confirm actual details and availability directly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer spotlight */}
      <section className="border-t border-white/10 bg-[#061a17] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Technology, Creativity &amp; Innovation</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">Meet the Developer</h2>
            <p className="mt-3 text-lg font-semibold text-emerald-100">Yashraj Puvar</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-300">Full Stack Developer and AI-ML enthusiast building modern, responsive and user-friendly web applications.</p>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Technical skills"><span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-stone-300">React.js</span><span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-stone-300">Node.js</span><span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-stone-300">MongoDB</span><span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-stone-300">AI-ML</span></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/developer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200/30 bg-emerald-300/[0.07] px-6 py-3 text-sm font-bold text-emerald-100 transition hover:border-emerald-200/60 hover:bg-emerald-300/[0.13]">View developer profile <span aria-hidden="true">↗</span></Link>
            <a href="https://www.linkedin.com/in/yashraj-puvar-412a43362/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-[#062017] transition hover:bg-emerald-300"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 10H5.67v8h2.67v-8Zm7.02-.19c-1.28 0-2.15.7-2.5 1.36V10h-2.67v8h2.67v-4.23c0-1.11.21-2.19 1.59-2.19 1.36 0 1.38 1.27 1.38 2.26V18h2.67v-4.69c0-2.31-.5-3.5-3.14-3.5ZM7 6.13a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1Z" /></svg>Connect on LinkedIn ↗</a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
