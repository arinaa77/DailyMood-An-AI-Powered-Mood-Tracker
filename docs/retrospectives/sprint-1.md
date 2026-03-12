# Sprint 1 Retrospective

**Sprint Goal:** Core app functionality : mood logging, calendar history, and basic trends. No auth or AI yet.

**Dates:** 2026-02-22 – 2026-02-28

**Milestone:** [Sprint 1](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/milestone/1)

---

## Planned Issues

| # | Title | Status |
|---|-------|--------|
| [#1](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/1) | Set up project structure | ✅ Closed |
| [#2](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/2) | Implement mood selection UI | ✅ Closed |
| [#3](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/3) | Build journal entry form with optional notes | ✅ Closed |
| [#4](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/4) | Create mood entry data model and Supabase table | ✅ Closed |
| [#5](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/5) | Build calendar view for entry history | ✅ Closed |
| [#6](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/6) | Implement basic mood trends dashboard | ✅ Closed |
| [#7](https://github.com/arinaa77/DailyMood-An-AI-Powered-Mood-Tracker/issues/7) | Add shared navigation and tab bar | ✅ Closed |

**Velocity:** 7/7 issues completed (100%)

---

## What Went Well

- **Solid foundation built fast.** The project scaffold (#1) : Next.js 15 App Router, Supabase, TypeScript strict mode, Tailwind : was set up on day one and never got in the way. Every subsequent feature built cleanly on top of it.
- **MoodPicker was clean and reusable from the start (#2).** The 1–5 emoji scale, accessible `aria-label` attributes, and `ring-2` selection state were defined once in `MoodPicker.tsx` and never had to be revisited.
- **Supabase schema was straightforward (#4).** Defining the `mood_entries` table with RLS policies up front meant all later data fetching hooks (`useMoodEntries`) had a stable, secure target.
- **All core screens delivered.** Log, Calendar, and Insights were functional by end of sprint : users could log a mood, view past entries on a calendar, and see a basic trends chart.

## What Didn't Go Well

- **Sprint dates delayed.** Several Sprint 1 issues (#3, #4, #5, #6, #7) were closed on 2026-03-12 : well past the 2026-02-28 due date. The milestone was not completed on time.
- **No tests shipped in Sprint 1.** Unit and E2E testing was deferred entirely to Sprint 2 (#11), which created a backlog of untested components and made later bug fixes riskier.
- **Auth was not included.** The sprint goal explicitly excluded auth, but this meant all Sprint 1 work was built without user-scoping, requiring rework when auth landed in Sprint 2.

## Action Items Carried Forward

- Add Vitest + React Testing Library alongside each new component going forward (picked up as #11 in Sprint 2).
- Wire authentication before building any more data features, so hooks can include `.eq('user_id', user.id)` from the start (#10 in Sprint 2).
