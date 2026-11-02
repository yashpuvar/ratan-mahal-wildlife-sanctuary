import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { getBearPhoto } from "../lib/bearPhotos";
import { formatPostDate, getPostCategory, getPostPhoto, getPostText, getUniquePostPhotos, POST_FILTERS } from "../lib/postEditorial";
import UiIcon from "../components/UiIcon";

const cardClass = "overflow-hidden rounded-2xl border border-white/10 bg-[#102920] shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/35 hover:shadow-2xl";

export function PostCard({ post, index, photo: suppliedPhoto }) {
  const photo = suppliedPhoto || getPostPhoto(post, index);
  const category = getPostCategory(post);
  const summary = post.description || "Read the latest story from the Ratan Mahal Wildlife Sanctuary journal.";

  return (
    <article className={`${cardClass} group flex h-full flex-col`}>
      <Link to={`/posts/${post._id}`} className="relative block aspect-[1.48/1] overflow-hidden bg-[#183a2b]" aria-label={`Read ${post.title}`}>
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = getBearPhoto(index + 1).src;
          }}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full border border-emerald-100/20 bg-[#071b16]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100 backdrop-blur">{category}</span>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {photo.isUploaded
          ? <p className="mb-2 w-fit text-[10px] text-stone-500">{photo.credit}</p>
          : <a href={photo.source} target="_blank" rel="noreferrer" className="mb-2 w-fit text-[10px] text-stone-500 underline decoration-white/20 underline-offset-2 hover:text-emerald-200">Photo: {photo.credit} · Wikimedia Commons</a>}
        <p className="text-xs font-medium text-stone-400">{formatPostDate(post.createdAt)}</p>
        <h3 className="mt-3 line-clamp-2 font-serif text-xl font-semibold leading-snug text-white sm:text-2xl">
          <Link to={`/posts/${post._id}`} className="transition hover:text-emerald-200">{post.title}</Link>
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-stone-300">{summary}</p>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="max-w-[65%] truncate text-xs text-stone-400">By {post.author || "Ratan Mahal Team"}</span>
          <Link to={`/posts/${post._id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition group-hover:gap-3" aria-label={`Read more: ${post.title}`}>Read story <UiIcon name="arrow-right" size={16} /></Link>
        </div>
      </div>
    </article>
  );
}

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadState, setLoadState] = useState("loading");
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [search, setSearch] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterNotice, setNewsletterNotice] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/api/posts", { timeout: 8000 })
      .then((response) => {
        if (!active) return;
        setPosts(Array.isArray(response.data?.data) ? response.data.data : []);
        setLoadState("loaded");
      })
      .catch(() => {
        if (!active) return;
        setPosts([]);
        setLoadState("offline");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const retryPosts = () => {
    setLoading(true);
    setLoadState("loading");
    api.get("/api/posts", { timeout: 8000 })
      .then((response) => {
        setPosts(Array.isArray(response.data?.data) ? response.data.data : []);
        setLoadState("loaded");
      })
      .catch(() => { setPosts([]); setLoadState("offline"); })
      .finally(() => setLoading(false));
  };

  const filters = useMemo(() => {
    const extras = [...new Set(posts.map(getPostCategory))]
      .filter((category) => !POST_FILTERS.includes(category));
    return [...POST_FILTERS, ...extras];
  }, [posts]);
  const postPhotos = useMemo(() => getUniquePostPhotos(posts), [posts]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return posts.filter((post) => {
      const categoryMatches = activeCategory === "All Posts" || getPostCategory(post) === activeCategory;
      return categoryMatches && (!query || getPostText(post).includes(query));
    });
  }, [activeCategory, posts, search]);

  return (
    <main className="min-h-screen bg-[#071b16] text-white">
      <section className="relative isolate flex min-h-[470px] items-end overflow-hidden sm:min-h-[540px] lg:min-h-[610px]">
        <img src={getBearPhoto(0).src} alt="Indian sloth bear moving through its natural woodland habitat" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full animate-cinematic object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#04130f]/95 via-[#04130f]/65 to-[#04130f]/15" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071b16] via-[#071b16]/25 to-[#071b16]/20" />
        <div className="photo-copy mx-auto w-full max-w-7xl px-5 pb-12 pt-32 sm:pb-16 md:px-8 lg:pb-20">
          <div className="page-enter max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300 sm:text-sm">Stories from the forest</p>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">Explore Our <span className="text-emerald-300">Latest Stories</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-200 sm:text-lg">Discover stories, conservation updates, wildlife insights and news from Ratan Mahal Wildlife Sanctuary.</p>
            <label className="mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/20 bg-[#071b16]/75 px-4 py-3.5 shadow-2xl backdrop-blur-md focus-within:border-emerald-300/70 focus-within:ring-2 focus-within:ring-emerald-300/20 sm:rounded-full sm:px-5">
              <UiIcon name="search" size={19} className="shrink-0 text-emerald-300" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles, wildlife, conservation..." aria-label="Search articles, wildlife, and conservation" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-stone-400 sm:text-base" />
              {search && <button type="button" onClick={() => setSearch("")} className="rounded-full px-3 py-1 text-xs font-semibold text-emerald-200 hover:bg-white/10">Clear</button>}
            </label>
          </div>
          <p className="photo-copy mt-5 text-[11px] text-white/65">Wildlife photographs are illustrative and credited to their creators; they are not represented as photographs taken at Ratan Mahal. <a href={getBearPhoto(0).source} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-emerald-200">Hero photo: {getBearPhoto(0).credit}</a></p>
        </div>
      </section>

      <section id="stories" className="bg-[#071b16] pb-16 pt-9 md:pb-24 md:pt-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Sanctuary journal</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Stories worth slowing down for</h2>
            </div>
            {!loading && loadState === "loaded" && <p className="text-sm text-stone-400">{posts.length} {posts.length === 1 ? "story" : "stories"}</p>}
          </div>

          <div className="-mx-5 mt-6 overflow-x-auto px-5 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0">
            <div role="group" aria-label="Filter stories by category" className="flex w-max gap-2">
              {filters.map((category) => <button key={category} type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${activeCategory === category ? "border-emerald-400 bg-emerald-500 text-[#082019] shadow-lg shadow-emerald-950/30" : "border-white/15 bg-white/[0.04] text-stone-300 hover:border-emerald-300/50 hover:text-white"}`}>{category}</button>)}
            </div>
          </div>

          {loading && <div className="grid gap-5 pt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" role="status" aria-label="Loading stories">{[0, 1, 2].map((item) => <div key={item} className="overflow-hidden rounded-2xl border border-white/10 bg-[#102920]"><div className="aspect-[1.48/1] animate-pulse bg-white/10"/><div className="space-y-3 p-6"><div className="h-3 w-24 animate-pulse rounded bg-white/10"/><div className="h-6 w-4/5 animate-pulse rounded bg-white/10"/><div className="h-14 animate-pulse rounded bg-white/10"/></div></div>)}</div>}

          {!loading && loadState === "offline" && <div className="mt-8 rounded-3xl border border-white/10 bg-[#102920] px-6 py-12 text-center sm:px-10"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-300/10 text-emerald-300"><UiIcon name="book" size={24}/></div><h3 className="mt-5 font-serif text-2xl font-semibold">The journal is taking a quiet moment</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-300">Stories will appear here when the sanctuary journal is reachable. Please try again in a little while.</p><button type="button" onClick={retryPosts} className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-[#082019] transition hover:bg-emerald-300"><UiIcon name="refresh" size={16}/> Try again</button></div>}

          {!loading && loadState === "loaded" && posts.length === 0 && <div className="mt-8 rounded-3xl border border-white/10 bg-[#102920] px-6 py-12 text-center sm:px-10"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-300/10 text-emerald-300"><UiIcon name="book" size={24}/></div><h3 className="mt-5 font-serif text-2xl font-semibold">A new chapter is on its way</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-300">There are no published stories yet. Please check back soon for updates from the sanctuary.</p></div>}

          {!loading && loadState === "loaded" && posts.length > 0 && filteredPosts.length === 0 && <div className="mt-8 rounded-3xl border border-white/10 bg-[#102920] px-6 py-12 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-300/10 text-emerald-300"><UiIcon name="search" size={23}/></div><h3 className="mt-5 font-serif text-2xl font-semibold">No stories match that search</h3><p className="mt-3 text-sm text-stone-300">Try another phrase or choose a different category.</p><button type="button" onClick={() => { setSearch(""); setActiveCategory("All Posts"); }} className="mt-5 rounded-full border border-emerald-300/40 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300/10">Clear search and filters</button></div>}

          {!loading && loadState === "loaded" && filteredPosts.length > 0 && <>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
              {filteredPosts.map((post) => {
                const index = posts.findIndex((item) => item._id === post._id);
                return <PostCard key={post._id} post={post} index={index} photo={postPhotos[index]} />;
              })}
            </div>
            <p className="mt-6 text-center text-xs text-stone-500">Showing {filteredPosts.length} of {posts.length} {posts.length === 1 ? "story" : "stories"}</p>
          </>}

          <div className="mt-16 grid gap-6 rounded-3xl border border-[#E3EAE4] bg-gradient-to-br from-white to-[#F7F9F6] p-7 shadow-sm sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Stay in the loop</p><h2 className="mt-3 font-serif text-3xl font-semibold">Get the Latest Updates</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">Subscribe to receive new stories, conservation news and sanctuary updates.</p></div>
            <form onSubmit={(event) => { event.preventDefault(); setNewsletterNotice("Newsletter sign-up is not connected yet. Your email has not been sent or saved."); }} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row lg:w-auto">
              <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/15 bg-[#071b16]/75 px-4 py-3"><UiIcon name="mail" size={18} className="shrink-0 text-emerald-300"/><input type="email" required value={newsletterEmail} onChange={(event) => { setNewsletterEmail(event.target.value); setNewsletterNotice(""); }} placeholder="Your email address" aria-label="Your email address" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-stone-500" /></label>
              <button type="submit" className="shrink-0 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#082019] transition hover:bg-emerald-300">Subscribe</button>
            </form>
            <p role="status" className="text-xs leading-5 text-stone-400 lg:col-start-2">{newsletterNotice || "Newsletter backend integration is required before email updates can be activated."}</p>
          </div>
          <p className="mt-8 text-center text-xs text-stone-500">Images in this journal are licensed, credited sloth bear photographs from Wikimedia Commons. They are illustrative and are not represented as photographs taken at Ratan Mahal.</p>
        </div>
      </section>
    </main>
  );
}

export default Posts;
