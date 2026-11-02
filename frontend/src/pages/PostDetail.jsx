import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import UiIcon from "../components/UiIcon";
import api from "../lib/api";
import { getBearPhoto } from "../lib/bearPhotos";
import { formatPostDate, getPostCategory, getPostPhoto, getUniquePostPhotos } from "../lib/postEditorial";
import { PostCard } from "./Posts";

const requestPost = (id) => Promise.allSettled([
  api.get(`/api/posts/${encodeURIComponent(id)}`, { timeout: 8000 }),
  api.get("/api/posts", { timeout: 8000 }),
]);

const resolvePostResponse = ([postResult, listResult]) => {
  if (postResult.status !== "fulfilled" || !postResult.value.data?.data) return null;
  const list = listResult.status === "fulfilled" && Array.isArray(listResult.value.data?.data)
    ? listResult.value.data.data
    : [];
  return { post: postResult.value.data.data, list };
};

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [state, setState] = useState("loading");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;
    requestPost(id)
      .then((result) => {
        if (!active) return;
        const resolved = resolvePostResponse(result);
        if (!resolved) {
          setPost(null);
          setState("unavailable");
          return;
        }
        setPost(resolved.post);
        setAllPosts(resolved.list);
        setState("loaded");
      })
      .catch(() => { if (active) setState("unavailable"); });
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => { active = false; };
  }, [id]);

  const retryPost = () => {
    setState("loading");
    requestPost(id)
      .then((result) => {
        const resolved = resolvePostResponse(result);
        if (!resolved) {
          setPost(null);
          setState("unavailable");
          return;
        }
        setPost(resolved.post);
        setAllPosts(resolved.list);
        setState("loaded");
      })
      .catch(() => setState("unavailable"));
  };

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const category = getPostCategory(post);
    const candidates = allPosts.filter((item) => item._id !== post._id);
    return [...candidates.filter((item) => getPostCategory(item) === category), ...candidates.filter((item) => getPostCategory(item) !== category)].slice(0, 3);
  }, [allPosts, post]);

  const shareArticle = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
        setFeedback("Thanks for sharing this story.");
      } else {
        await navigator.clipboard.writeText(url);
        setFeedback("Story link copied.");
      }
    } catch (error) {
      if (error.name !== "AbortError") setFeedback("Copy this page link to share the story.");
    }
  };

  if (state === "loading") return <main className="grid min-h-[70vh] place-items-center bg-[#071b16] px-5 text-white"><p role="status" className="text-stone-300">Loading story…</p></main>;

  if (state === "unavailable" || !post) return <main className="grid min-h-[70vh] place-items-center bg-[#071b16] px-5 py-16 text-white"><div className="max-w-lg rounded-3xl border border-white/10 bg-[#102920] p-8 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-300/10 text-emerald-300"><UiIcon name="book" size={24}/></div><h1 className="mt-5 font-serif text-2xl font-semibold">This story is unavailable right now</h1><p className="mt-3 text-sm leading-6 text-stone-300">The journal may be offline, or this story may no longer be published.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={retryPost} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-[#082019]"><UiIcon name="refresh" size={16}/> Try again</button><Link to="/posts" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold">Back to stories</Link></div></div></main>;

  const postPhotos = getUniquePostPhotos(allPosts);
  const currentPostIndex = allPosts.findIndex((item) => item._id === post._id);
  const photo = postPhotos[currentPostIndex] || getPostPhoto(post, 0);
  const sameCategoryPosts = relatedPosts.map((item) => ({ ...item, _editorialIndex: allPosts.findIndex((candidate) => candidate._id === item._id) }));

  return (
    <main className="min-h-screen bg-[#071b16] text-white">
      <section className="relative isolate flex min-h-[380px] items-end overflow-hidden sm:min-h-[480px] lg:min-h-[560px]">
        <img src={photo.src} alt={photo.alt} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = getBearPhoto(1).src; }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#04130f]/90 via-[#04130f]/55 to-[#04130f]/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071b16] via-transparent to-[#071b16]/20" />
        <div className="photo-copy mx-auto w-full max-w-7xl px-5 pb-12 pt-32 md:px-8 md:pb-16">
          <Link to="/posts" className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-emerald-200"><UiIcon name="arrow-left" size={17}/> All stories</Link>
          <div className="mt-9 max-w-4xl">
            <span className="rounded-full border border-emerald-100/20 bg-[#071b16]/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100 backdrop-blur">{getPostCategory(post)}</span>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">{post.title}</h1>
            <p className="mt-5 text-sm text-stone-200">{formatPostDate(post.createdAt)} <span aria-hidden="true">·</span> By {post.author || "Ratan Mahal Team"}</p>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-7xl px-5 pb-14 md:px-8 md:pb-20">
        <div className="mx-auto grid max-w-6xl gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16 lg:pt-12">
          <div>
            <p className="whitespace-pre-line text-base leading-8 text-stone-200 sm:text-lg">{post.description}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5">
              <button type="button" onClick={shareArticle} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-stone-200 transition hover:border-emerald-300/60 hover:text-emerald-200"><UiIcon name="share" size={16}/> Share story</button>
              {feedback && <span role="status" className="text-xs text-stone-400">{feedback}</span>}
            </div>
            <p className="mt-8 border-l-2 border-emerald-400/70 pl-4 text-xs leading-5 text-stone-500">{photo.isUploaded ? photo.credit : <>Photography: <a href={photo.source} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-emerald-200">{photo.credit}, via Wikimedia Commons</a>. Illustrative image; not represented as photographed at Ratan Mahal.</>}</p>
          </div>
          <aside className="h-fit rounded-2xl border border-white/10 bg-[#102920] p-6 lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">About this story</p>
            <dl className="mt-5 space-y-4 text-sm"><div><dt className="text-xs text-stone-500">Category</dt><dd className="mt-1 text-stone-200">{getPostCategory(post)}</dd></div><div><dt className="text-xs text-stone-500">Published</dt><dd className="mt-1 text-stone-200">{formatPostDate(post.createdAt)}</dd></div><div><dt className="text-xs text-stone-500">Author</dt><dd className="mt-1 text-stone-200">{post.author || "Ratan Mahal Team"}</dd></div></dl>
            <Link to="/posts" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:gap-3">Back to posts <UiIcon name="arrow-right" size={16}/></Link>
          </aside>
        </div>
      </article>

      {sameCategoryPosts.length > 0 && <section className="border-t border-white/10 bg-[#0a211a] py-14 md:py-20"><div className="mx-auto max-w-7xl px-5 md:px-8"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Keep exploring</p><h2 className="mt-3 font-serif text-3xl font-semibold">Related stories</h2></div><Link to="/posts" className="hidden items-center gap-2 text-sm font-semibold text-emerald-200 sm:inline-flex">All posts <UiIcon name="arrow-right" size={16}/></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{sameCategoryPosts.map(({ _editorialIndex, ...item }) => <PostCard key={item._id} post={item} index={Math.max(0, _editorialIndex)} photo={postPhotos[_editorialIndex]} />)}</div></div></section>}
    </main>
  );
}

export default PostDetail;
