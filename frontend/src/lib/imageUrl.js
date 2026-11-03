const env = import.meta.env || {};
export const IMAGE_API_ORIGIN = (env.VITE_API_URL?.trim() || (env.DEV ? 'http://localhost:5000' : 'https://ratan-mahal-backend.onrender.com')).replace(/\/+$/, '');
const base = env.BASE_URL || '/';
export const IMAGE_FALLBACK = base + 'images/bears/gallery/sloth-bear-ranthambore.jpg';

// Only API/upload paths belong to Render; bundled public assets belong to Vite.
export function resolveImageUrl(value, apiOrigin = IMAGE_API_ORIGIN) {
  if (typeof value !== 'string' || !value.trim()) return IMAGE_FALLBACK;
  let path = value.trim().replace(/\\/g, '/');
  if (/^(blob:|data:image\/)/i.test(path)) return path;
  if (path.startsWith('//')) path = 'https:' + path;
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      // Older records may contain an absolute API URL for a frontend public file.
      const backend = new URL(apiOrigin);
      if (url.hostname === backend.hostname && /^\/(?:public\/)?images\//.test(url.pathname)) {
        return base + url.pathname.replace(/^\/(?:public\/)?/, '') + url.search + url.hash;
      }
      // Unparameterized originals can decode to >130 MB on a phone. Ask the
      // original host for a bounded version; preserve existing/signed queries.
      if (url.hostname === 'images.pexels.com' && !url.search) {
        url.protocol = 'https:';
        url.search = 'auto=compress&cs=tinysrgb&w=1600';
        return url.href;
      }
      if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
        if (url.protocol === 'https:') return path;
        url.protocol = 'https:';
        return url.href;
      }
      path = url.pathname + url.search + url.hash;
    } catch { return IMAGE_FALLBACK; }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return IMAGE_FALLBACK;
  path = path.replace(/^(?:\.\/|\/)+/, '').replace(/^public\//, '');
  if (/^(api|uploads)\//.test(path)) return apiOrigin.replace(/\/+$/, '') + '/' + path;
  return base + path;
}
