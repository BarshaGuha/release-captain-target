# Baseline timing — manual run (GO scenario, `release/v1.2.0`)

Filled in by hand, by a human with a stopwatch, before building any subagent.
This is the real "before" number the whole pitch depends on.

| # | Step (from RELEASE_CHECKLIST.md) | Minutes | Notes |
|---|---|---|---|
| 1 | Write release notes | 0:47 | |
| 2 | Check dependency risk | 2:03 | Only version bump in package.json, no new/changed dependencies → low risk |
| 3 | Run tests, read results | 0:30 | 12 pass, 0 fail — all green |
| 4 | Check requirement coverage | 9:31 | All R1–R10 covered; R3 only tests the 404 path, no explicit positive "get one" test — minor real gap |
| 5 | Make the go/no-go call | 0:27 | GO |
| 6 | Write rollback note | 1:18 | Revert to release/v1.1.0 |
| | **Total** | **14:36** | |

Once this is filled in, the number in row "Total" replaces the "~120 min"
placeholder everywhere it appears — the pitch deck, the doc, and the demo
script.

---

## NO-GO run (`release/v1.2.0-regression`) — to be filled in next

| # | Step (from RELEASE_CHECKLIST.md) | Minutes | Notes |
|---|---|---|---|
| 1 | Write release notes | | |
| 2 | Check dependency risk | | |
| 3 | Run tests, read results | | |
| 4 | Check requirement coverage | | |
| 5 | Make the go/no-go call | | |
| 6 | Write rollback note | | |
| | **Total** | | |
