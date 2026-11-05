# Sanctuary operating status

The backend computes visitor status in `Asia/Kolkata`; it never uses the
visitor's device timezone. No official operating hours are supplied by this
change, and no production schedule is initialized by deployment.

## Rules

1. An emergency `closed` override wins over every schedule.
2. An active temporary closure also produces Closed Now.
3. Otherwise, only a complete seven-day schedule explicitly confirmed by the
   administrator can produce Open Now or a scheduled Closed Now.
4. A weekly closed day, special closure date, time before opening, or time at/after
   closing is Closed Now. The former Opening Soon interval remains closed.
5. Missing, unconfirmed or invalid schedules produce Hours Not Confirmed.
   API failures also produce this safe gray badge, with an explanation in its panel.

Legacy `manualOverride: open` values cannot bypass these rules and are treated
as automatic. The admin API no longer accepts a manual-open override. The
existing schema value remains readable for backward compatibility; no data
migration or auth/recovery changes are needed.

## Activate a real official schedule

Sign in with a fully authorized Admin account and open Admin > Sanctuary Hours
& Status (`/admin/sanctuary-hours`). Enter the actual verified opening/closing
times for each open weekday, mark closed weekdays, and configure closure dates
and temporary closure reasons as appropriate. Same-day closing must follow
opening. New forms have blank times. Legacy 09:00-17:00 values are examples,
not evidence of official timings.

After reviewing the real schedule, check **I confirm these are the sanctuary's
official operating hours**, then Save opening hours. Editing a weekday clears
that confirmation in the form and requires confirmation again. Saving without
confirmation preserves a draft and does not publish its timings. Emergency Closed
can be enabled even while hours remain unconfirmed; choose Automatic schedule
to remove it. Temporary/special/weekly closures still apply in Automatic mode.

Only authenticated, unrestricted admins can edit these settings. The existing
`requireAdmin` middleware and password-change/recovery protections are unchanged.
Schedule writes target only the existing `sanctuarysettings` document with ID
`sanctuary`; updates do not change its hotel status field or other collections.

## Freshness and live updates

`GET /api/sanctuary/status` returns a coherent status, today's confirmed hours,
weekly information, and a short validity deadline in one uncached response.
`GET /api/sanctuary/hours` remains supported and never publishes unconfirmed times.
Status snapshots expire within 15 seconds or at the next minute boundary,
whichever comes first. The UI accounts for request latency and invalidates stale
status while requesting a replacement. Older aborted responses cannot overwrite
a newer closure.

An admin save returns the new public snapshot to refresh that browser's badge
immediately. A local-storage signal refreshes other tabs. Anonymous read-only
`GET /api/sanctuary/events` streams refresh notifications to visitors connected
to that Node process; disconnects release listeners. Ten-second polling and
focus/visibility refresh provide fallback for browsers without EventSource,
failed streams, and multiple backend instances. There is no cross-process pub/sub,
so multi-instance deployments rely on that polling fallback for other instances.

The badge is visible without opening the mobile menu. Click it for today's
confirmed hours, closure explanation and next scheduled opening. The panel
supports Escape, close-button focus restoration and narrow screens. API errors
clear stale timings instead of claiming the sanctuary is open.

## Verification

Run `npm test --prefix backend`, `npm test --prefix frontend`,
`npm run lint --prefix frontend`, and `npm run build --prefix frontend`.
From `frontend`, run `npx playwright test --workers=1` for Chromium and WebKit.
Tests use illustrative fixture hours and mocked database writes; they never
configure production timings. Validate production with public GETs and anonymous
authorization-denial checks only. An authenticated save of genuine official
hours is an Admin action and must not be fabricated as a deployment smoke test.
