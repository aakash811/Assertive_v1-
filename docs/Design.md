# design.md — Assertive

## Translating the brainstorm into something buildable

The source document's website concepts (a rotating 3D "Constellation" of glowing test nodes, a trace card that "unravels" into the trace viewer, a cinematic terminal video background) are fun ideas for a marketing site, but they're **not where this project's engineering value lives**, and building them would burn real time on animation polish instead of the multi-tenancy/transactionality/flakiness work that actually makes this project resume-strong. Skip the landing page entirely, or reduce it to a single clean static page later if you want one. This doc focuses on the **dashboard** — the part people (and interviewers) will actually use.

That said, a few ideas buried in the marketing brainstorm are genuinely good **dashboard** features once stripped of the cinematic framing — called out below where that's the case.

## 1. Core Design Principle: The Dashboard Should Never Lie

Because the whole product thesis is "code is the source of truth, the dashboard reflects it automatically," the UI needs to make **sync state and data freshness visually obvious at all times** — a stale test case, a currently-syncing state, or a test with no runs yet should never look identical to a healthy, up-to-date one. This is the UI expression of this project's thesis, the same way Vault's tenant-switcher was the UI expression of its isolation thesis.

## 2. Color & Theme

- Dark mode as default (matches the "developer tool, not enterprise SaaS" positioning the brainstorm itself leans toward), light mode as a toggle, persisted — this part of the original plan (Epic 5, task 5.12) is sound, keep it.
- Status colors, used consistently everywhere a status appears (test case list, run detail, dashboard cards): **green** (passed), **red** (failed), **blue/gray** (skipped), **amber** (timed out), **faint gray** (stale/not_run) — this maps directly and sensibly from the brainstorm's "constellation node color" idea, just applied to normal UI elements (badges, table rows) instead of a 3D graphic.
- A distinct, unmissable visual treatment for **flaky** tests — not just another status color, since flaky isn't a status, it's a pattern across runs. A small pulsing or striped indicator next to the badge works; reserve this treatment for nothing else so it stays meaningful.
- Sync state gets its own visual language, separate from test status: `stale` tests should look visibly faded/muted in list views (the brainstorm's instinct here — Epic 5, task 5.10 — is correct, keep it), `new` tests get a small "new" badge.

## 3. Typography

- One UI sans-serif throughout (Inter or system-ui) for the app chrome. Test case **descriptions** render as GFM Markdown (per FR1/the brainstorm's "Spec Composer" idea) in a serif or slightly larger body font to visually distinguish "documentation content" from "app UI" — this is a genuinely nice touch worth carrying over from the brainstorm, it just doesn't need the split-screen live-typing animation to work.
- Monospace for: `unique_id`s (TST-001), file paths, commit SHAs, error stack traces, and anything inside the embedded trace viewer.

## 4. Key Screens

### Test Case List

- Table with color-coded status badges, sync-state visual treatment (faded for stale), flaky indicator, tags as small colored pills
- Filters: status, tag (multi-select), type, owner, flaky toggle, sync-state toggle, free-text search
- This is a dense data table by nature — don't over-decorate it; clarity and scannability matter more than visual flourish here specifically

### Test Case Detail

- Metadata panel + **rendered Markdown description** (Spec Composer idea, simplified)
- Recent runs as a **compact timeline**, not just a table — status icon, duration, branch/commit, environment, timestamp, trace link per row
- **Stability/flakiness visualization** — this is the one brainstorm idea worth building close to as originally described (the "Test Health Stream," Section 3 of the marketing brainstorm): a horizontal strip of small colored segments, one per recent run, green/red. A solid green strip reads as stable at a glance; a chaotic mix reads as flaky at a glance — this is a genuinely good, cheap-to-build data visualization, not a gimmick. Recharts or a simple custom SVG strip both work fine; don't over-engineer it into an animated "stream."
- History/audit panel: reverse-chronological cards, one per `test_case_history` entry, readable diff text ("Priority changed from medium to high"), actor, relative timestamp — no edit controls, same immutability-signaling principle as Vault's audit log screen

### Embedded Trace Viewer

- On a failed run with a `trace_url`, show a "View Trace" action that loads Playwright's actual trace-viewer web component (or embeds it via iframe) directly in the run detail panel — this is a real, achievable version of the brainstorm's "Trace Weaver" idea, just without the card-unraveling animation. The value (inspecting a failure without leaving the browser or downloading a file) is real; the animation was never the point.

### Dashboard Home / Metrics

- Overview cards: total test cases, pass rate (latest batch), flaky count, stale count
- Trend chart: pass rate over last N batches (simple line chart — Recharts)
- Breakdown charts: by test type, by status — simple bar/donut, no need for anything elaborate
- Quick links to failed and flaky tests

### Settings

- Project: name, description, repo URL, ID prefix (read-only after first test case exists, to avoid `unique_id` collisions — worth deciding explicitly and documenting, not leaving implicit)
- API keys: masked list, create (show-once modal), revoke
- Organization: members list with roles, invite flow

## 5. What to explicitly not build

- No 3D/WebGL "Constellation" visualization — real engineering cost, zero product value, and actively distracts from the parts of this project that make a strong resume story
- No cinematic video backgrounds or typing-animation heroes on the dashboard itself
- No card "unravel" transition animation for the trace viewer — a clean expand/modal achieves the same functional goal
- Don't over-invest in the marketing/landing page at all in v1; if you want one eventually, a simple static page describing the product plainly is enough

## 6. Tone & Naming

- Keep terminology consistent with what's already in the schema and API (`test_case`, `run_batch`, `sync_state`, `flaky`) rather than inventing prettier UI-only synonyms — a developer tool's UI should speak the same language as its API and CLI output, so a user moving between `getassertive sync`'s terminal output and the dashboard doesn't have to mentally translate.
- Empty states should be actionable, not just decorative (the brainstorm's own instinct here, Epic 5 task 5.12, is correct): "No test cases yet — run `getassertive sync`" beats a generic empty-state illustration.

## Bottom line

Spend design effort on the dashboard's information clarity (status/sync-state color language, the stability strip, the embedded trace viewer) and skip the landing-page spectacle entirely. The parts of the original brainstorm worth keeping are the ones that make real product data easier to read at a glance — not the ones that make a good product demo video.
