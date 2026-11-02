# Image loading investigation and fix

Validated 2 November 2026.

## Findings

- Visitor photo records store `/api/gallery/visitor/image/:id`. Gallery rendered that path directly, so browsers requested Vercel instead of Render. Backend and frontend are separate origins. This is a confirmed source defect, independent of viewport size.
- Posts rejected most saved image URLs in favor of stock photographs. Video cards and admin management also ignored saved images/thumbnails. These views now retain saved URLs.
- Admin image previews hid failed images. Several other views had no fallback or handlers that could retry indefinitely. Shared SiteImage now resolves URLs and applies a single bundled fallback.
- Production GET checks returned 200 image/jpeg for sampled bear, hotel and video poster assets. Local .jpg files have JPEG signatures. Production gallery, posts and videos returned empty data arrays during investigation, so there were no public production upload records to reproduce against. No mobile-only CSS defect was established.
- Visitor uploads are written to backend/uploads/visitor-photos, excluded from Git. MongoDB stores metadata and filename, not image bytes. Without a persistent disk at that directory, Render restarts/redeployments can lose these files. URL fixes cannot recover lost bytes.

## Changes

- Added src/lib/imageUrl.js: Vite public assets stay on frontend; api/uploads paths use configured backend or production fallback; legacy localhost paths are rebased; external HTTPS URLs remain unchanged; HTTP URLs upgrade to HTTPS; blob/data image previews remain supported.
- Added src/components/SiteImage.jsx: shared bounded error fallback without changing existing image dimensions, lazy loading or object-fit classes.
- Updated src/lib/postEditorial.js to preserve saved post photos.
- Updated image consumers: pages/Home.jsx, About.jsx, Posts.jsx, PostDetail.jsx, Gallery.jsx, Videos.jsx, Stay.jsx, Contact.jsx; components/Navbar.jsx; admin/AdminManage.jsx, CreateGallery.jsx, CreateVideo.jsx, VisitorPhotoManagement.jsx.
- Added test/imageUrl.test.mjs.

All paths above are under frontend/. No photos, records, credentials, backend contracts, authentication or booking code changed.

## Validation

- npm ci --prefix frontend: passed. npm reported 6 moderate and 1 high dependency vulnerabilities; no dependency updates made.
- npm run build --prefix frontend: passed; existing large-chunk warning remains.
- node --test frontend/test/*.test.mjs: 5 tests passed.
- Headless Edge against the built Vite preview: Home, About, Posts, Gallery, Videos and Stay at 320, 375, 390, 768 and 1440px. After scrolling images into view: zero unloaded/broken images, zero zero-width images, no horizontal overflow across 30 page/viewport checks.
- Browser fixtures confirmed an approved visitor image requests the Render origin and a missing image displays the bundled fallback.
- npm run lint --prefix frontend: two pre-existing react-hooks/set-state-in-effect errors in Gallery.jsx and VisitorPhotoManagement.jsx. Confirmed both on HEAD source using ESLint stdin. No new lint errors remain.
- No backend files changed, so backend checks were unnecessary.
- Physical Android Chrome and iPhone Safari were unavailable. Edge viewport tests do not establish actual-device compatibility. Authenticated uploads, admin operations, Google login and bookings were not exercised against production.

## Deployment and durable storage

Deploy the frontend on Vercel after merging/pushing main. If the existing Git integration is enabled, the push should trigger deployment; otherwise redeploy manually. Render does not require a redeploy for this frontend change.

Proposed separate storage work: use Cloudinary or S3 for future uploads, keep existing routes/contracts, and migrate surviving files only after approval and an inventory/backup. Alternatively configure a Render persistent disk at the upload directory. A storage implementation or migration was not performed. Existing missing files require recovery from backups or re-upload; fallbacks only prevent a broken image display.
