# Sprint 3 Retrospective

**Sprint Goal:** Polish, auth hardening, and API completeness : fix UI bugs, wire auth middleware, add Google OAuth, health check endpoint, and data export API.

**Dates:** 2026-03-11 : 2026-03-12

**Milestone:** [Sprint 3](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/milestone/3)

---

## Planned Issues

| # | Title | Status |
|---|-------|--------|
| [#15](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/15) | Fix week strip ring overlap on log page sidebar | ✅ Closed |
| [#16](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/16) | Add /api/health endpoint | ✅ Closed |
| [#17](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/17) | Wire up auth middleware (middleware.ts) | ✅ Closed |
| [#18](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/18) | Add Google OAuth login | ✅ Closed |
| [#19](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/19) | Add data export endpoint (GET /api/export) | ✅ Closed |
| [#20](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/20) | Audit: bug fixes and remove redundant code | ✅ Closed |
| [#21](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/21) | Fix calendar timezone bug: entries appear on wrong day | ✅ Closed |
| [#27](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/27) | fix(log): 'This week' strip clips today's entry and status label incorrect | ✅ Closed |

**Velocity:** 8/8 issues completed (100%)

**Pull Requests Merged:**
| PR | Title |
|----|-------|
| [#22](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/pull/22) | Fix/issue 15 : week strip ring overflow |
| [#23](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/pull/23) | Feature/issue 16 : health endpoint |
| [#25](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/pull/25) | Fix/issue 21 : calendar timezone |
| [#28](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/pull/28) | Fix/issue 27 : log week strip clipping |

---

## What Went Well

- **Fast, focused sprint.** Sprint 3 was a two-day polish sprint with a tight scope : all 8 issues closed on time, the first sprint to hit its due date.
- **Root cause found on the week strip bug (#27).** The `lastNDays(7)` overflow was traced precisely: `7 × 36px + 6 × 4px gap = 276px` overflowing a 280px container. Reducing to `lastNDays(5)` fixed clipping cleanly without layout hacks. The status label ("Pending" → "Not logged yet") was fixed in the same PR.
- **Calendar timezone bug resolved (#21, PR #25).** Entries were appearing on the wrong day due to UTC/local timezone mismatches in date comparisons. Fixing this improved data accuracy for all users outside UTC.
- **Auth middleware properly hardened (#17).** Unauthenticated users are now correctly redirected to `/login` on all protected routes, closing the gap left from Sprint 2.
- **API surface completed.** The `/api/health` (#16) and `GET /api/export` (#19) endpoints rounded out the public API, both documented in `docs/API.md`.

## What Didn't Go Well

- **Bug accumulation from earlier sprints.** Three of the eight Sprint 3 issues (#15, #21, #27) were bug fixes for problems introduced in Sprints 1 and 2. Better test coverage earlier : especially for timezone handling and layout overflow : would have caught these before they reached production.

## Overall Project Retrospective

Across all three sprints, the core DailyMood feature set was delivered: mood logging, calendar history, AI insights, auth, editing/deletion, CI/CD, tests, and a documented API.

**Key technical decisions that paid off:**
- Server-side-only Anthropic calls kept the API key secure throughout.
- Two Supabase clients (browser vs. server) prevented silent auth failures.
- `moodUtils.ts` helpers (`emojiFromScore`, `labelFromScore`) kept the mood scale consistent : no scattered hardcoded strings.

**What to do differently next time:**
- Set milestone due dates that reflect actual working time, not calendar end dates.
- Write tests alongside each feature in the same sprint : not deferred to a later sprint.
- Timebox E2E test authoring; Playwright setup reliably took longer than estimated.
