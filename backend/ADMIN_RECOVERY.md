# Owner-reviewed recovery runbook (not authorization to execute)

Do not execute recovery until the owner has approved the exact production
cluster fingerprint, database, email and one-time creation action. A successful
local read-only connection or matching public posts does not establish the
actual Render configuration. An email address alone is not proof of ownership.

## Establish the production target and check backups

Use an authorized Render session to inspect the deployed commit and its active
MongoDB configuration privately. Never copy the URI/password to chat, logs or
GitHub. A blank URI database path selects `RatanMahal` in `config/db.js` unless
`MONGODB_DB_NAME` overrides it. Confirm the startup database-name log and privately
match the URI cluster hostname against the intended Atlas cluster.

The operator can run `npm run admin:recover` WITHOUT `--execute` in the existing
production environment, if a Render shell is available, to obtain the sanitized
read-only plan. Run the same command locally and compare the complete cluster
fingerprint and database. Plan mode disables automatic collection/index creation.
Do not supply a URI as a command-line argument or print environment variables.
If no production shell exists, an authorized owner must confirm the hostname and
active database from the Render configuration and startup logs. CLI approval
flags record this attestation; they do not independently prove it.

In the matching Atlas project/cluster, inspect snapshot/PITR availability and
any owner-held database exports. Backup availability remains UNKNOWN until
actually checked. An available snapshot is not proof it contains the admin.
Reviewing backup contents by an isolated restore is a separate mutation requiring
separate owner approval. Never restore the whole production database over Posts,
Gallery, Videos or other collections. Prefer a separately reviewed account-only
restore if the original admin is recoverable. Do not claim backup absence merely
because an integration or permission is unavailable.

## Review and deploy protection before account creation

Backend and frontend first-password-change code must be tested, reviewed and
deployed with owner authorization before recovery. The recovery CLI checks
`/api/health` for `adminRecoveryProtocol: 1` and refuses execution if absent.
This checks deployment capabilities, not database identity or ownership.
Temporary account credentials expire in one hour. Login issues a 15-minute
password-change-only token. `/api/admin/me` exposes only safe account identity
and the change-required flag. All standard admin APIs enforce password change
server-side, even if a caller bypasses the frontend.

## Exact approval and execution

The owner must approve all of the following after the preceding checks:

- The full verified production cluster fingerprint and database `RatanMahal`.
- Target admin email `yashrajpuvar442@gmail.com`.
- No original admin is recoverable from reviewed backups/exports.
- Create exactly one temporary Admin only if the collection remains empty.
- Keep the `first-admin` lock document and add a permanent one-time recovery
  marker/audit containing the operation ID, approval reference, target and times.
- Change no documents outside `admins` and the existing `first-admin` lock.
- Generate a temporary password in the owner's private terminal and require a
  new permanent password before any dashboard access.

After recorded approval, in a PRIVATE, non-recorded local terminal, in `backend`,
the operator runs the following template, substituting the approved fingerprint
and approval reference (these are not passwords):

```text
npm run admin:recover -- --execute --database RatanMahal --email yashrajpuvar442@gmail.com --cluster-fingerprint VERIFIED_FINGERPRINT --approval-ref OWNER_APPROVAL_REFERENCE --production-verified --no-recoverable-backup
```

Never run `--execute` through assistant execution tools, CI, deployment shells,
screen recordings or terminal transcript capture: the password is displayed
only on the owner's interactive terminal. Execution requires typing an exact
target confirmation there. The script generates 192 random bits via Node crypto
AFTER confirmation, uses the existing Admin save hook to hash with bcrypt, and
never accepts the password through arguments or environment variables.

Transaction support is mandatory. The retained setup lock serializes concurrent
recovery attempts, an empty-admin check runs inside the transaction, and the
recovery marker prevents reuse even if that admin is subsequently removed.
Account creation and audit completion commit together with majority write
concern. There is no non-transactional fallback and no lock deletion.

## Verify and change the temporary password

The CLI tests production `POST /api/admin/login`, checks the exact new admin ID
through authenticated `GET /api/admin/me`, and verifies `GET /api/contacts` is
blocked with `ADMIN_PASSWORD_CHANGE_REQUIRED`. Tokens are neither displayed nor
saved. It displays the temporary email/password only in the private terminal;
save it directly in a password manager and do not paste it into chat.

Sign in at the existing production `/admin/login`. The app routes to
`/admin/change-password`. Password fields conceal entry. Enter the temporary
password and a different new password twice. The new password must be at least
12 characters and at most 72 UTF-8 bytes. The backend checks the current password,
rehashes via the existing model save hook, clears the forced-change/expiry state,
increments the credential version and rejects previous tokens. Optimistic
concurrency prevents competing stale password changes from both succeeding.

Finally verify fresh login, `/api/admin/me` with `mustChangePassword: false`, and
dashboard access. Confirm the old temporary password fails. If recovery commits
but verification fails, do not retry creation or remove the marker: investigate
the deployment/target mismatch and report the partial result. An expired
temporary account also needs separately authorized recovery; this tool cannot
be reused to create another admin.

Tests use isolated fixtures/mocked persistence. They do not constitute a real
Atlas transaction/concurrency test or production login verification. No production
recovery or deployment has been authorized by this runbook.

## Final preparation review — 2026-11-05

Owner attestations: intended production database is `RatanMahal`; Render's
cluster hostname matches the intended Atlas cluster; no recoverable backup or
owner-held export is available. Backup absence is an owner attestation, not a
claim that a backup restore was performed. Production linkage is based on that
attestation; a direct Render-process fingerprint has not been independently read.

Current authorized read-only target fingerprint (SHA-256 of the cluster host,
not a password or URI):

```text
a2f60a90c62a835ed36e4beb60eaa231884fc1fb2c67a4256ab678e53e3382ea
```

Read-only checks found zero Admins, the retained `first-admin` lock, no
`ownerRecovery` field, an existing `admins` collection and unique email index,
no database-level collection validator, and replica-set/session support.
The proposed model fields are additive; no migration of other collections is
needed. Live transaction commits/concurrency were not tested: this review
authorizes no writes. At execution time, all target/state checks run again.

### Two separate approval gates

**Gate A: code release only.** After owner approval, review and commit only the
following safe code, tests and this runbook; never include `.env`, credentials,
passwords or captured terminal output. Push that reviewed commit to main and
record its SHA before observing deployments.

Backend runtime changes:

- `models/Admin.js`: forced-change flag, credential version, temporary expiry,
  optimistic concurrency; existing bcrypt hook retained.
- `controllers/adminAuthController.js`: restricted login and guarded initial
  password-change controller, token-version invalidation and no-store responses.
- `middleware/authMiddleware.js`: server-enforced restrictions for every
  ordinary admin route; only identity/password-change middleware permits the
  restricted session.
- `routes/adminAuthRoutes.js`: safe `/me` identity and password-change endpoint.
- `server.js`: non-secret `adminRecoveryProtocol: 1` deployment readiness flag.

Owner-only recovery tooling (never called by server startup):

- `scripts/recoverAdmin.js`, `services/adminRecovery.js`, and the `admin:recover`
  npm script in `package.json`.

Frontend runtime changes:

- `src/App.jsx`, `src/admin/Login.jsx`, `src/components/AdminProtectedRoute.jsx`,
  `src/admin/ChangePassword.jsx`: route and enforce initial password change,
  masked password entry, no credential logging, and normal dashboard access only
  after the protected API confirms completion.

Include regression tests `backend/test/adminRecovery.test.js`,
`backend/test/adminPasswordChange.test.js`, and
`frontend/test/responsive/admin-password-change.spec.js` in the reviewed commit.
The existing `frontend/vercel.json` wildcard already covers the new admin route.
No changes to JWT_SECRET, OAuth, MongoDB credentials, the normal `admin:init`
script or production environment values are needed.

Deploy the reviewed backend commit to Render and frontend commit to Vercel.
Build/start commands remain `npm ci` / `npm start` for the backend and
`npm ci` / `npm run build` for the frontend. Neither runs admin initialization.
Require both deployments to be successful before continuing. Check:

```powershell
Invoke-RestMethod 'https://ratan-mahal-backend.onrender.com/api/health' | Select-Object success, adminRecoveryProtocol
Invoke-RestMethod 'https://ratan-mahal-backend.onrender.com/api/posts' | Select-Object success, count
npm run admin:recover
```

The last command runs from `backend` in an authorized environment and is
read-only. Expected health protocol is `1`; Posts count remains `2` unless normal
site activity has independently changed it. Check the exact Render/Vercel commit
SHAs and privately confirm startup database/cluster identity. In a signed-out
browser, `/admin/change-password` must redirect to login. Do not send a password
using shell commands or display a JWT/Authorization header as verification.

**Gate B: one-time database recovery.** Only AFTER Gate A's live checks and a
fresh read-only plan match, obtain a second explicit approval naming the full
fingerprint, `RatanMahal`, `yashrajpuvar442@gmail.com`, exactly one temporary Admin
and addition of the existing lock's permanent recovery audit marker. Then use
the private-terminal execution template above. Do not reuse the previously
exposed bootstrap password: recovery generates an independent random password.

Expected verification after this separately approved action:

| Stage | Required result |
| --- | --- |
| Transaction commits | Exactly one matching Admin; same lock retained with completed audit |
| Temporary login | HTTP 200, matching Admin ID, change-required flag, restricted token |
| Restricted `/api/admin/me` | HTTP 200 with matching identity and `mustChangePassword: true` |
| Standard admin API before change | HTTP 403 `ADMIN_PASSWORD_CHANGE_REQUIRED` |
| User changes password in masked form | HTTP 200; flag cleared; version incremented |
| Fresh normal login and `/me` | HTTP 200; `mustChangePassword: false`; dashboard available |
| Old temporary password/token | Rejected |

No production login or password-change success is claimed by preparation tests.

### Rollback plan

- Before database recovery, verify Admin count is still zero and the recovery
  marker absent. If a deployment is unhealthy, stop. With approval, roll back
  the affected deployments to the recorded prior successful versions. Current
  repository baseline is `e4f467f8dd4920cfc30d445b00e7b45467f3cb17`; confirm
  provider deployment metadata rather than assuming this is the current live SHA.
- If the transaction aborts, MongoDB rolls back account creation and marker
  changes together. Do not delete the original lock or switch to a non-transactional
  insert. On an ambiguous network/commit error, inspect state read-only before
  deciding anything; never assume an abort or automatically rerun recovery.
- AFTER recovery commits, NEVER roll back the backend to a version that lacks
  forced-change, expiry and restricted-token enforcement. The old middleware
  would ignore these protections. Preserve the account and audit; diagnose and
  apply an owner-approved forward fix or a protection-compatible rollback.
  Do not delete the account/marker or reset passwords as automatic rollback.
- Temporary password expiry also requires separately authorized remediation;
  initialization cannot be reused. This prevents an expired recovery from
  silently creating an additional Admin.

This procedure's only production writes, if separately approved, are one new
Admin and the recovery marker on the existing setup-lock document; the subsequent
owner-initiated password change modifies that same Admin. Posts, Gallery, Videos,
Users and every other collection are outside the write scope.
