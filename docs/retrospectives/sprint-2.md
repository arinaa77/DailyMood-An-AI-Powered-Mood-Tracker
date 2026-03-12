# Sprint 2 Retrospective

**Sprint Goal:** AI features, auth, and production readiness:  AI-powered insights, user authentication, entry editing/deletion, CI/CD pipeline, E2E tests, API documentation, and deployment polish.

**Dates:** 2026-03-01 – 2026-03-10

**Milestone:** [Sprint 2](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/milestone/2)

---

## Planned Issues

| # | Title | Status |
|---|-------|--------|
| [#8](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/8) | Personal milestone records computed from accumulated mood entries | ✅ Closed |
| [#9](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/9) | Add entry editing and deletion | ✅ Closed |
| [#10](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/10) | Add user authentication | ✅ Closed |
| [#11](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/11) | Write unit tests for mood components | ✅ Closed |
| [#12](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/12) | Set up CI/CD pipeline | ✅ Closed |
| [#13](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/13) | Add public API documentation | ✅ Closed |
| [#14](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/14) | Update project documentation | ✅ Closed |

**Velocity:** 7/7 issues completed (100%)

---

## What Went Well

- **Auth integrated cleanly (#10).** Supabase email/password auth with redirect middleware landed without breaking existing data hooks. The two-client pattern (`client.ts` / `server.ts`) kept auth concerns isolated and prevented key leakage.
- **AI insights are server-side only.** The Anthropic API integration in `app/api/insights/route.ts` kept the API key out of the client bundle. The 5-entry gate and per-user/per-day caching worked as designed on first implementation.
- **Editing and deletion shipped safely (#9).** Edit opens a pre-filled modal; delete requires a confirmation dialog. No destructive single-click actions:  personal data is protected.
- **CI/CD pipeline established (#12).** Automated checks on every PR meant regressions were caught before merge for the rest of the project.
- **Unit tests added (#11).** Vitest + React Testing Library coverage was added for mood components, giving a safety net for Sprint 3 refactors.

## What Didn't Go Well

- **Sprint dates delayed.** Like Sprint 1, several issues closed on 2026-03-12:  two days past the 2026-03-10 due date. Scope was accurate but velocity estimates were still too optimistic.
- **Auth middleware not fully wired.** Despite auth landing in this sprint, the `middleware.ts` guard was incomplete:  it was raised as a separate issue (#17) and fixed in Sprint 3. This meant unauthenticated route protection had a gap.in limited to email/password only.
- **E2E tests were harder than expected.** Playwright setup and reliable test authoring took significantly longer than estimated, contributing to the date slip.

## Action Items Carried Forward

- Complete auth middleware to block unauthenticated routes (#17, Sprint 3).
- Add Google OAuth (#18, Sprint 3).
- Investigate and fix calendar timezone bug surfaced during testing (#21, Sprint 3).
