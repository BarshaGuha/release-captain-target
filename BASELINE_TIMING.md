# Baseline timing — manual run

Filled in by hand, by a human with a stopwatch, before building any subagent.
This is the real "before" number the whole pitch depends on.

## GO scenario (`release/v1.2.0`)

| # | Step (from RELEASE_CHECKLIST.md) | Minutes | Notes |
|---|---|---|---|
| 1 | Write release notes | 0:47 | |
| 2 | Check dependency risk | 2:03 | Only version bump in package.json, no new/changed dependencies → low risk |
| 3 | Run tests, read results | 0:30 | 12 pass, 0 fail — all green |
| 4 | Check requirement coverage | 9:31 | All R1–R10 covered; R3 only tests the 404 path, no explicit positive "get one" test — minor real gap |
| 5 | Make the go/no-go call | 0:27 | GO |
| 6 | Write rollback note | 1:18 | Revert to release/v1.1.0 |
| | **Total** | **14:36** | |

## NO-GO scenario (`release/v1.2.0-regression`)

| # | Step (from RELEASE_CHECKLIST.md) | Minutes | Notes |
|---|---|---|---|
| 1 | Write release notes | 0:59 | Two commits since v1.1.0: the real feature commit, plus "Tidy up todos route handlers" — message says "no functional changes intended," gives no hint of the regression |
| 2 | Check dependency risk | 0:59 | Only version bump, no dependency changes → low risk. Dependency check gives no signal on this regression — the bug isn't dependency-related |
| 3 | Run tests, read results | 2:17 | 11 pass, 1 fail — `rejects DELETE without an api key` fails: expected 401, got 204. Confirms DELETE endpoint lost its API-key check |
| 4 | Check requirement coverage | 6:47 | R9 fails on inspection — DELETE handler is missing `requireApiKey` that POST and PUT both have. All other R1–R8, R10 unaffected — same as GO run |
| 5 | Make the go/no-go call | 0:27 | NO-GO — one test failing, R9 not satisfied |
| 6 | Write rollback note | 0:53 | Revert to release/v1.1.0, or revert just commit dd96e8b |
| | **Total** | **12:22** | |

## What this shows

Both runs took roughly the same time by hand (~13–15 min) even though one
hides a real security regression behind an innocent-looking commit message.
A human reading `git log` alone would have no reason to suspect anything —
the only step that reliably caught the bug was actually running the test
suite (Row 3), not reading commit messages or scanning code by eye.

These numbers — not the earlier "~120 min" placeholder — are what belong in
the pitch deck, the doc, and the demo script.
