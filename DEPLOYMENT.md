# Posts deployment checks

The backend always allows the exact permanent frontend origin:
`https://ratan-mahal-wildlife-sanctuary-9fv5.vercel.app`.
`FRONTEND_ORIGIN` accepts comma-separated additional exact origins, with surrounding
whitespace and a trailing slash normalized. Add each trusted Vercel preview URL
explicitly. Wildcards and arbitrary `*.vercel.app` access are not supported.
CORS runs before JSON parsing and all routes. Authorization and Content-Type
preflights remain supported; login and admin authorization are unchanged.

## Render

For the existing backend service, select branch `main`, root directory `backend`,
build command `npm ci`, and start command `npm start`.
Set `MONGODB_DB_NAME=RatanMahal` (case-sensitive) in Environment, then save and
deploy. Keep the existing MongoDB URI and authentication secrets private and
unchanged. The URI must target the Atlas cluster containing the existing posts.
The code defaults a URI without a database path to `RatanMahal`; an explicit URI
database or environment override remains authoritative.
Set `NODE_ENV=production`. Set `FRONTEND_ORIGIN` to the permanent frontend URL
and, if needed, append individually trusted preview origins separated by commas.
Verify the startup log says `MongoDB connected successfully (database: RatanMahal)`.
If automatic deployment is disabled, use Manual Deploy > Deploy latest commit.

## Vercel

Keep root directory `frontend`, production branch `main`, build command
`npm run build`, and output directory `dist`.
Set `VITE_API_URL=https://ratan-mahal-backend.onrender.com` for Production and
any Preview environment being tested. Redeploy after changing this build-time
variable. The existing production fallback already points to that backend.

## Verification

Run `npm test --prefix backend`, `npm test --prefix frontend`, and
`npm run build --prefix frontend`.
From the frontend directory, run `node test/production-posts.mjs` for a read-only
Chromium check of the actual production API request and both displayed stories.
This requires the Playwright Chromium browser to be installed.

Expected API: `GET /api/posts` returns HTTP 200 with `success: true`, `count: 2`,
and both published records in `data`, sorted newest first. Expected IDs:
`6ae4657b506cb8dc7b77ac4b` and `6aca19f90049eab38302404f`.
An allowed Origin must receive its exact Access-Control-Allow-Origin value;
an untrusted Origin must receive no Access-Control-Allow-Origin header.
No database migration or record changes are needed.
