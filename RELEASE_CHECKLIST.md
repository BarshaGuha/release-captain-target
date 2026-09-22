# Manual release checklist (the "as-is" process)

This is what a person currently does by hand before shipping this project.
It's the process Release Captain's four subagents automate. Use this same
list, done by hand once with a stopwatch, to produce the "before" numbers
in `BASELINE_TIMING.md` — that's what makes the demo's time-saved claim real
instead of estimated.

1. **Write release notes.** Read `git log` since the last release tag, group
   the commits, and write a human-readable changelog entry.
2. **Check dependency risk.** Open `package.json`, check whether any
   dependency changed, and judge whether the change could break something.
3. **Run the tests and read the results.** Run `npm test`, read the output,
   and note anything that failed or looks suspicious.
4. **Check requirement coverage.** Open `requirements.md` and, for each item,
   check the code and the tests to confirm it's actually implemented and
   covered.
5. **Make the call.** Decide go / no-go, and write down why.
6. **Write a rollback note.** One sentence on what to revert and how, in
   case the release needs to be undone.

Time every step. Don't estimate — a stopwatch number is the only kind that
belongs in the pitch deck.
