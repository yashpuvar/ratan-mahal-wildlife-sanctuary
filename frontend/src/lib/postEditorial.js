import { BEAR_PHOTOS, getApprovedBearPhoto } from "./bearPhotos.js";

export const POST_FILTERS = [
  "All Posts",
  "Wildlife",
  "Conservation",
  "Sanctuary Updates",
  "Community",
  "Travel & Stay",
];

export function getPostCategory(post) {
  const original = String(post?.category || "Wildlife").trim();
  const value = original.toLowerCase();
  if (/wildlife|bear|nature|forest life|animal/.test(value)) return "Wildlife";
  if (/conserv|awareness|habitat|environment/.test(value)) return "Conservation";
  if (/sanctuary|update|news|announcement/.test(value)) return "Sanctuary Updates";
  if (/community|education|outreach|event|people/.test(value)) return "Community";
  if (/travel|stay|visitor|guide|tourism/.test(value)) return "Travel & Stay";
  return original;
}

export function getPostPhoto(post, index = 0) {
  const image = String(post?.image || "");
  // User-submitted post images are served from this local directory only.
  if (/^\/images\/posts\/[a-z0-9][a-z0-9._-]*\.(?:jpe?g|png|webp)$/i.test(image)) {
    return {
      src: image,
      alt: post?.imageAlt || "Forest-covered hills fading into a soft blue haze",
      credit: "Image shared with this post",
      source: "",
      isUploaded: true,
    };
  }

  // Keep legacy and selected wildlife imagery on the existing approved set.
  return getApprovedBearPhoto(post?.image, index);
}

export function getUniquePostPhotos(posts) {
  const used = new Set();
  return posts.map((post, index) => {
    const preferred = getPostPhoto(post, index);
    if (preferred.isUploaded) {
      used.add(preferred.src);
      return preferred;
    }
    const photo = [preferred, ...BEAR_PHOTOS.slice(index).concat(BEAR_PHOTOS.slice(0, index))]
      .find((candidate) => !used.has(candidate.src)) || preferred;
    used.add(photo.src);
    return photo;
  });
}

export function getPostText(post) {
  return [post?.title, post?.description, post?.content, post?.body, post?.category]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

export function formatPostDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

