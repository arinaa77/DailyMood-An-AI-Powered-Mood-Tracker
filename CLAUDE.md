# CLAUDE.md: DailyMood

Context file for AI-assisted development. Read this before touching any feature.

---

## 1. Project Context
DailyMood is a full-stack mood tracking app. Users log a mood (1 to 5 scale) plus an optional note and optional photo each day. The AI reads their accumulated entries and surfaces emotional patterns. The whole point is that logging should take under 30 seconds.

### Tech Stack

Next.js 15 (App Router), TypeScript (strict), Tailwind CSS 3.x, Supabase (Postgres + Auth + Realtime),
Anthropic API (`claude-haiku-4-5`), Recharts 2.x, date-fns 3.x, Vitest + React Testing Library,
Playwright (E2E). Deployed on Vercel.

Next.js gives us server components, API route handlers, middleware, and image optimization all in one
place. No separate Express server needed. Supabase handles the database, auth (JWT-based with Google
OAuth support), real-time subscriptions, and file storage.

### Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # login screen (email + Google OAuth)
│   ├── (app)/
│   │   ├── layout.tsx            # shared nav/tab bar for authenticated screens
│   │   ├── log/
│   │   │   └── page.tsx          # new entry form
│   │   ├── calendar/
│   │   │   └── page.tsx          # monthly history grid
│   │   └── insights/
│   │       └── page.tsx          # trends + AI
│   ├── api/
│   │   └── insights/
│   │       └── route.ts          # POST /api/insights (server-side only, Anthropic calls live here)
│   └── layout.tsx                # root layout, providers
├── components/
│   ├── mood/         # MoodPicker, MoodBadge (anything tied to the 1-5 scale)
│   ├── calendar/     # CalendarGrid, EntryDetail
│   ├── insights/     # StatsCards, MoodBarChart, AIInsightsCard
│   └── ui/           # Button, Card, Modal, Toast (generic primitives only)
├── hooks/
│   ├── useMoodEntries.ts # all reads/writes for entries
│   └── useInsights.ts    # AI insights fetch + the 5-entry gate logic
├── lib/
│   ├── supabase/
│   │   ├── client.ts # browser Supabase client (use in components/hooks)
│   │   └── server.ts # server Supabase client (use in route handlers only)
│   ├── anthropic.ts  # server-side only, never import from a component
│   └── moodUtils.ts  # emojiFromScore(), labelFromScore(), colorFromScore()
└── types/
    └── index.ts      # MoodEntry, InsightsResult, etc. All shared types live here.
```

The mood scale is integers 1-5: `1 = Awful, 2 = Bad, 3 = Okay, 4 = Good, 5 = Great`.
Always use the helpers from `moodUtils.ts`. Don't scatter emoji/label strings across components.

### Architecture Decisions Worth Knowing

**Data fetching lives in hooks, not components.** If you're fetching inside a component body, move it to a hook in `/hooks/`. Components should receive data as props or call a hook, nothing else.

**AI calls are server-side only.** The Anthropic API key cannot be in the client bundle. All calls go through `app/api/insights/route.ts` (a Next.js Route Handler). Don't import `anthropic.ts` from anything under `src/components/` or the `(app)` route group.

**Two Supabase clients, not one.** `lib/supabase/client.ts` is for the browser (components and hooks). `lib/supabase/server.ts` is for route handlers and server components. Using the wrong one in the wrong context causes auth to break silently.

**No external state library.** `useState`/`useReducer` is enough for this app. Don't add Redux or Zustand.

### Naming

- Components: `PascalCase` -> `MoodPicker.tsx`
- Hooks: `useCamelCase` -> `useMoodEntries.ts`
- Utils: `camelCase` -> `emojiFromScore()`
- Types/interfaces: `PascalCase` -> `MoodEntry`
- Constants: `UPPER_SNAKE` -> `MAX_NOTE_LENGTH = 500`
- Test files: co-located with the component -> `MoodPicker.test.tsx`
- No custom CSS class names. Tailwind only.

### Testing

Vitest + React Testing Library for unit and integration tests. Playwright for E2E. Test files live next to the component they cover. E2E specs live in `/e2e/`.

Target 80% line coverage minimum. CI fails below that number.

Focus coverage on `/components/mood/` and `/components/ui/`. These have clear, testable behavior.
Test what the user does (click, type, submit), not how the component is structured internally.
Use `userEvent` not `fireEvent`. Mock Supabase and Anthropic. Never hit real APIs in tests.

---

## 2. PRD & Design References

DailyMood lets users log a mood (5 options) + optional note each day. The AI reads accumulated
entries and surfaces emotional patterns. Core UX goal: a full entry in under 30 seconds.

There are three screens. This is the whole app.

### Screen 1: Log (New Entry) `LogPage.tsx`

Default landing screen. Centered white card. Mood row at top, textarea below, save button at bottom.

**Mood picker (US-1, Issue #2)**
- 5 emoji buttons in a row: 😄 Great · 🙂 Good · 😐 Okay · 😞 Bad · 😢 Awful
- Selected state: `ring-2 ring-indigo-500 scale-110` + glow. One selection at a time.
- Each button needs `aria-label="Select mood: Great"`. Emoji alone isn't accessible.
- Touch target minimum 44px on mobile.
- Save button stays disabled until one is picked.

**Notes textarea (US-2, Issue #3)**
- `placeholder="What's on your mind?"`
- 500 char limit (`MAX_NOTE_LENGTH`). Counter shows remaining; goes red at <= 50.
- Optional. The form submits fine with just a mood.
- On save: write to Supabase, show a success toast, reset the form. That's it.

### Screen 2: Calendar `CalendarPage.tsx`

Monthly grid. Dates with entries show the mood emoji. Clicking a date expands details below
the grid (mood, formatted timestamp, note text). Today gets `bg-indigo-100 text-indigo-700`.

Month navigation: prev/next arrows top corners. Entry count badge for the current month.
Empty state copy: `"No entries this month. Start logging to see your history."`

(US-3, Issue #4)

### Screen 3: Insights `InsightsPage.tsx`

**Stats row (US-4, Issue #5)**
Three cards: Average Mood (one decimal), Top Mood (emoji + label), Entry Count.
Time range toggle below: `7 days | 30 days | 90 days`, pill style, updates the chart.

**Bar chart**
Recharts `BarChart`. X = date, Y = mood score 1-5.
Bar color by score: `#22c55e` (4-5) / `#eab308` (3) / `#ef4444` (1-2).
Target: loads in under 2 seconds. Don't fetch more data than the selected range needs.

**AI Insights card (US-5, Issue #6)**
Locked until the user has >= 5 entries. Below that threshold show:
`"Log X more entries to unlock insights!"` with a progress indicator.

When unlocked, the card shows AI-generated output: most common mood, possible triggers pulled
from note text, weekly trend summary. Tone should be warm and conversational, not clinical.
The card gets a ✨ icon and regenerates whenever a new entry is saved. Cache the result
(per user, per day) so we're not calling the API on every page load.

**Edit / Delete (US-6, Issue #7)**
Edit opens a modal with pre-filled mood and note. Delete requires a confirmation dialog.
Never on a single click. Both actions should trigger a refetch so the chart and insights update.

**Auth (US-7, Issue #8)**
Supabase email/password. Unauthenticated users redirect to `/login`. Logout in the nav header.
All Supabase queries are scoped to the authenticated `user_id`. RLS handles enforcement.

### Design Tokens

```
Background:   bg-gradient-to-br from-slate-100 to-purple-50
Card:         bg-white rounded-2xl shadow-md p-6
Accent:       indigo-500 (#6366f1) primary, violet-500 (#8b5cf6) secondary
Text:         gray-900 headings, gray-600 body, gray-400 placeholder
Nav tabs:     active -> bg-indigo-500 text-white, inactive -> text-gray-500 hover:text-gray-700
Transitions:  duration-150 ease-in-out on interactive elements
Mood button:  w-16 h-16 desktop, w-12 h-12 mobile, rounded-full, text-3xl emoji
```

### Component Contracts

These props aren't negotiable. Keep them consistent across the codebase:

```ts
<MoodPicker selectedMood={number | null} onMoodSelect={(score: number) => void} />
<NoteTextarea value={string} onChange={(val: string) => void} />
<SaveEntryButton disabled={boolean} loading={boolean} onClick={() => void} />
<CalendarGrid entries={MoodEntry[]} month={Date} onDateSelect={(date: Date) => void} />
<MoodBarChart data={DailyMoodSummary[]} />
<AIInsightsCard insights={string | null} entriesCount={number} />
```

`CalendarGrid` and `MoodBarChart` are pure display. No data fetching inside them.

---

## 3. Scrum & Workflow

### Branches

```
feature/US-1-mood-picker
feature/US-5-ai-insights
fix/issue-14-calendar-month-nav
chore/setup-vitest
docs/update-readme
```

Pattern: `feature/US-N-slug`, `fix/issue-N-slug`, `chore/slug`, `docs/slug`.
One issue per branch. Branch off `main`, never off another feature branch.

### Commits

Conventional Commits. Keep the subject line under 72 chars.

```
feat(mood-picker): add ring glow and scale on selection

Closes #2
```

```
fix(calendar): off-by-one in month boundary for January

Was using getMonth() without accounting for 0-index. Closes #14
```

Types: `feat` `fix` `chore` `docs` `test` `refactor`. Use `test` when the commit is only tests.

### PRs

- Title matches the issue title closely enough that it's obvious what it does.
- Body must have `Closes #N`. Without this the issue won't auto-close.
- Squash merge. Delete the branch after.
- At least one review before merging, even if it's a quick one.

Reference the GitHub issue at the top of the feature's main file:
```tsx
// US-1: Mood Selection (Issue #2)
```

---

## 4. What to Watch Out For

### Things that will break if you get them wrong

**The Anthropic key.** If you import `lib/anthropic.ts` from a client component, the key ends up
in the JS bundle and anyone can read it. All AI calls go through `app/api/insights/route.ts` only.

**Mood scale consistency.** The DB stores 1-5 integers. The chart uses them. The AI prompt uses them.
If you hardcode `"Great"` or `😄` in three different places and someone changes the copy, you'll
have a bug in two of them. Use `emojiFromScore()` and `labelFromScore()` from `moodUtils.ts`.

**Delete without confirmation.** This is a destructive, irreversible action on personal data.
Always show a confirmation modal. A misclick shouldn't wipe someone's entry.

**Supabase queries without user scoping.** Even though RLS prevents data leaks, don't write
queries that rely solely on RLS as your only filter. Always include `.eq('user_id', user.id)`
explicitly. It makes the intent clear and is a second layer of safety.

### Library preferences

- Charts: Recharts. Not Chart.js, not D3.
- Dates: date-fns. Not moment (bundle is enormous), not raw `Date` math.
- Validation: zod for anything going to Supabase.
- Don't add new dependencies without a reason. Check if something already in the stack covers it.

### Accessibility minimums

- Every emoji-only or icon-only button needs an `aria-label`.
- Every interactive element needs a visible `focus-visible:ring-2` state.
- Mood buttons show both the emoji and the text label, not emoji alone.
- Error messages use `aria-describedby` to associate with the input they describe.
- Color isn't the only signal. Bar chart colors also have tooltip text with the score.

### TypeScript

Strict mode is on. `any` is a last resort, not a default. If you're reaching for `any`, define
an interface or use `unknown` and narrow it. Props always have an explicit type, no implicit `{}`.
