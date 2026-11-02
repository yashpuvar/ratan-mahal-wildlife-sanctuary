# Posts image investigation

## Confirmed findings

- The configured local Atlas connection selected `test.posts`, which contained no posts.
- Read-only inspection found the two expected records in `RatanMahal.posts`. Database names are case-sensitive.
- Both records have `isPublished: true` and use the schema's `image` string field. The list controller filters published records and sorts by newest first; it does not paginate.
- With `MONGODB_DB_NAME=RatanMahal`, the local HTTP list endpoint returned both records and each detail endpoint returned the original image reference.
- The existing frontend uses `getPostPhoto` and `SiteImage` with the shared image resolver. Both original images rendered in browser tests; no image-field conversion or replacement is needed.

| Post | Saved image reference | Production resource check |
| --- | --- | --- |
| Indian Bear (Gujarat) | `https://images.pexels.com/photos/24589420/pexels-photo-24589420.jpeg` | HTTPS, HTTP 200, `image/jpeg`, 5,286,314 bytes |
| A View Across the Forested Hills | `/images/posts/forested-hills-landscape.jpg` | Vercel frontend origin, HTTPS, HTTP 200, `image/jpeg`, 230,662 bytes |

Neither reference uses Render uploads or localhost. There is no evidence of lost ephemeral files for these two posts. The forest image is a tracked frontend public asset; preserve its exact case and path.

## Production limits and recovery

- The Vercel home page and both original image resources were reachable. Direct `/posts` navigation returned HTTP 404 before the routing fix. `frontend/vercel.json` now routes the list and detail URLs to the SPA entry point.
- Navigating from the production home page to Posts reached the React page, but the backend request timed out. Direct requests to the Render API also timed out. Production database selection and API contents could not be verified, and the cause of the Render timeout is not established.
- In Render, inspect service Events/logs and confirm the intended database selection. Set `MONGODB_DB_NAME=RatanMahal` (supported by this fix), or use `/RatanMahal` as the URI database path. If both are supplied, the explicit environment variable wins. Keep the Atlas authentication options and credentials unchanged. Restart/redeploy the backend, then verify `/api/posts` returns the two IDs below.
- Expected IDs: `6aca19f90049eab38302404f` and `6ae4657b506cb8dc7b77ac4b`.
- Check the Vercel production build's `VITE_API_URL` points to the intended Render service. The inspected live bundle included `https://ratan-mahal-backend.onrender.com`; its local-development fallback is not evidence that production uses localhost.
- Local ignored `.env` was corrected only by selecting `MONGODB_DB_NAME=RatanMahal`. No connection credentials or database records were changed. Production environment variables were not changed.

Do not recreate the posts or replace their photos. If an image later becomes unavailable, recover the original from its source or backup and restore the same reference where possible; obtain approval before changing a saved image reference.
