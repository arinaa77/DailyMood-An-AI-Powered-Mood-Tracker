# DailyMood

A full-stack mood tracking web app.

Log how you feel each day, browse your history on a calendar, and understand your emotional patterns through a trends dashboard.

Built by Yihan Wang and Kaichen Qu.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Supabase · Recharts

---

## Features

### Mood Entry : Log page
- Select a mood from 5 options: 😄 Great, 🙂 Good, 😐 Okay, 😞 Bad, 😢 Awful
- Add an optional note (up to 500 characters, live character counter)
- Save button stays disabled until a mood is selected
- Success banner on save; form resets automatically
- Entries update across all open tabs in real time via Supabase Realtime

**Log page sidebar** (desktop):
- Today's date and logged/not-logged status
- 7-day mood strip showing this week at a glance
- Current streak counter and total entry count

### Entry History : Calendar page
- Monthly calendar grid : dates with entries show the mood emoji
- Navigate between months with prev/next arrows
- Entry count badge for the current month
- Click any date to expand the full entry (mood, timestamp, note)
- Empty state: "No entries this month. Start logging to see your history."

### Edit & Delete
- Edit button opens a pre-filled modal,  change mood and/or note, then save
- Delete button opens a confirmation dialog before removing the entry
- Both actions immediately refetch so all views stay in sync

### Trends Dashboard: Insights page
- Three stat cards: Average Mood, Top Mood, Entry Count
- Time-range toggle: 7 days / 30 days / 90 days
- Bar chart (Recharts) with bars coloured by score: green (4–5), yellow (3), red (1–2)
- Personal Records card: longest streak, best month, favorite mood, total entries logged

### Authentication
- Email and password sign-up and sign-in via Supabase Auth
- Unauthenticated users are redirected to `/login` automatically
- All data is scoped to the signed-in user at both the query level and via Row Level Security

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Font | Plus Jakarta Sans (via `next/font/google`) |
| Database + Auth | Supabase (PostgreSQL + RLS + Realtime) |
| Charts | Recharts 2 |
| Dates | date-fns 4 |
| Validation | Zod |
| Unit / Integration tests | Vitest + React Testing Library |
| E2E tests | Playwright |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/         # Sign-in / sign-up page
│   ├── (app)/
│   │   ├── layout.tsx        # Collapsible left sidebar nav + mobile bottom bar
│   │   ├── log/              # Daily mood entry form + stats sidebar
│   │   ├── calendar/         # Monthly history + edit/delete
│   │   └── insights/         # Stats cards, bar chart, personal records
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Redirects / → /log
├── components/
│   ├── mood/MoodPicker.tsx       # 5-button mood selector + notes form
│   ├── calendar/CalendarGrid.tsx # Monthly grid with mood emojis
│   ├── calendar/EntryDetail.tsx  # Expanded entry with edit/delete
│   ├── insights/StatsCards.tsx   # Avg mood, top mood, entry count
│   ├── insights/MoodBarChart.tsx # Recharts bar chart
│   ├── insights/MilestoneCards.tsx # Personal records (streak, best month, etc.)
│   └── ui/Modal.tsx              # Reusable dialog
├── hooks/
│   └── useMoodEntries.ts     # All CRUD + Supabase Realtime subscription
├── lib/
│   ├── moodUtils.ts          # emojiFromScore(), labelFromScore(), colorFromScore()
│   └── supabase/
│       ├── client.ts         # Browser client (hooks + components)
│       └── server.ts         # Server client (route handlers)
├── proxy.ts                  # Auth guard : redirects unauthenticated requests
└── types/index.ts            # MoodEntry, DailyMoodSummary, InsightsResult
```

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd DailyMood-An-AI-Powered-Mood-Tracker
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase SQL editor, run:

```sql
create table mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  mood_score integer not null check (mood_score between 1 and 5),
  note text default '' not null,
  created_at timestamptz default now() not null
);

alter table mood_entries enable row level security;

create policy "Users own their entries"
  on mood_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

3. In **Authentication → Providers → Email**, disable "Confirm email" for local development so sign-up works without an email confirmation step.

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-anon-key>
```

Use the **Publishable (anon)** key from Supabase → Project Settings → API. Never use the Secret key. Never commit `.env.local`.

### 4. Start the dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run all unit + integration tests |
| `npm run test:watch` | Re-run tests on file save |
| `npm run test:coverage` | Coverage report (80% threshold) |

---

## Tests

### Unit + Integration (Vitest + React Testing Library)

```bash
npm test
npm run test:coverage
```

| File | Tests |
|---|---|
| `src/lib/moodUtils.test.ts` | 18 |
| `src/components/mood/MoodPicker.test.tsx` | 23 |
| `src/components/ui/Modal.test.tsx` | 7 |
| `src/components/calendar/EntryDetail.test.tsx` | 10 |
| `src/components/calendar/CalendarGrid.test.tsx` | 10 |
| `src/components/insights/StatsCards.test.tsx` | 6 |
| `src/components/insights/MoodBarChart.test.tsx` | 7 |
| `src/app/(auth)/login/page.test.tsx` | 11 |
| `src/components/insights/MilestoneCards.test.tsx` | 8 |
| `src/app/(app)/log/page.test.tsx` | 10 |
| **Total** | **111** |

Coverage (statements / branches / functions / lines): **97% / 98% / 95% / 97%** : all above the 80% threshold.

> Next.js pages and layouts are excluded from unit coverage : they are covered by the Playwright E2E suite instead.

### E2E (Playwright)

```bash
# Install browsers (first time only)
npx playwright install

# Run all specs (starts dev server automatically)
npx playwright test

# Headed mode
npx playwright test --headed

# Interactive UI
npx playwright test --ui

# Single spec
npx playwright test e2e/auth.spec.ts
npx playwright test e2e/app.spec.ts

# View HTML report
npx playwright show-report
```

| Spec | Covers |
|---|---|
| `e2e/auth.spec.ts` | Login form render, sign-up toggle, invalid credentials error, loading state, auth redirect |
| `e2e/app.spec.ts` | Log page, Calendar, Insights, Navigation, Mobile layout |

E2E tests mock all Supabase HTTP calls via `page.route()` : no live database or credentials needed.

---

## API Reference

### Hook: `useMoodEntries`

The primary data layer for the app. Import and use inside any client component.

```ts
import { useMoodEntries } from '@/hooks/useMoodEntries';

const { entries, loading, error, createEntry, updateEntry, deleteEntry } = useMoodEntries();
```

| Member | Type | Description |
|---|---|---|
| `entries` | `MoodEntry[]` | All entries for the signed-in user, newest first |
| `loading` | `boolean` | `true` while the initial fetch is in flight |
| `error` | `string \| null` | Error message from the last failed fetch |
| `createEntry(mood_score, note)` | `Promise<void>` | Insert a new entry and refetch |
| `updateEntry(id, mood_score, note)` | `Promise<void>` | Update an existing entry by ID and refetch |
| `deleteEntry(id)` | `Promise<void>` | Delete an entry by ID and refetch |

All mutations throw on Supabase error. Wrap calls in try/catch in the UI layer.

The hook also subscribes to a Supabase Realtime channel (`mood_entries_changes`) so any change in another tab triggers an automatic refetch.

### Database schema: `mood_entries`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `user_id` | `uuid` | References `auth.users(id)` |
| `mood_score` | `integer` | 1 (Awful) – 5 (Great), enforced by check constraint |
| `note` | `text` | Optional, defaults to `''` |
| `created_at` | `timestamptz` | Defaults to `now()` |

Row Level Security is enabled : users can only read and write their own rows. All queries also include `.eq('user_id', user.id)` explicitly as a second safety layer.

### Utility functions: `src/lib/moodUtils.ts`

```ts
import { emojiFromScore, labelFromScore, colorFromScore } from '@/lib/moodUtils';
```

| Function | Returns | Example |
|---|---|---|
| `emojiFromScore(score)` | Emoji string | `emojiFromScore(5)` → `"😄"` |
| `labelFromScore(score)` | Label string | `labelFromScore(3)` → `"Okay"` |
| `colorFromScore(score)` | Hex colour | `colorFromScore(2)` → `"#ef4444"` |

Falls back to `"❓"` / `"Unknown"` / `"#94a3b8"` for out-of-range scores. Always use these helpers : never scatter emoji or label strings across components.

**Mood scale:**

| Score | Label | Emoji | Colour |
|---|---|---|---|
| 5 | Great | 😄 | `#22c55e` (green) |
| 4 | Good | 🙂 | `#22c55e` (green) |
| 3 | Okay | 😐 | `#eab308` (yellow) |
| 2 | Bad | 😞 | `#ef4444` (red) |
| 1 | Awful | 😢 | `#ef4444` (red) |

### Shared types: `src/types/index.ts`

```ts
interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;   // 1–5
  note: string;
  created_at: string;   // ISO 8601 timestamp
}

interface DailyMoodSummary {
  date: string;         // Formatted label e.g. "Mar 5"
  mood_score: number;   // Aggregated score for that day
}

interface InsightsResult {
  content: string | null;
  generated_at: string | null;
}
```

### Component props

```ts
// Mood entry form : handles its own state internally
<MoodPicker onSave={(mood: number, note: string) => Promise<void>} />

// Monthly calendar grid : pure display, no data fetching
<CalendarGrid
  entries={MoodEntry[]}
  month={Date}
  selectedDate={Date | null}
  onDateSelect={(date: Date) => void}
/>

// Expanded entry detail panel
<EntryDetail
  entry={MoodEntry | null}
  onEdit={() => void}
  onDelete={() => void}
/>

// Bar chart : pure display
<MoodBarChart data={DailyMoodSummary[]} />

// Stats row : computes average/top mood from entries prop
<StatsCards entries={MoodEntry[]} />

// Personal records : all-time highlights computed client-side
<MilestoneCards entries={MoodEntry[]} />

// Reusable dialog : closes on Escape and backdrop click
<Modal open={boolean} onClose={() => void} title={string}>
  {children}
</Modal>
```

---

## Authentication Flow

1. Any request to an `/(app)/` route hits `proxy.ts` first.
2. `proxy.ts` refreshes the Supabase session cookie and checks for a user.
3. No user → redirect to `/login`. Authenticated user on `/login` → redirect to `/log`.
4. Sign-in and sign-up both use `supabase.auth.signInWithPassword` / `supabase.auth.signUp`.
5. On success the client redirects to `/log`.
6. Logout calls `supabase.auth.signOut()` and redirects to `/login`.

Two separate Supabase clients prevent auth from breaking silently:
- `lib/supabase/client.ts` : browser client (`createBrowserClient`), used in all hooks and client components.
- `lib/supabase/server.ts` : server client (`createServerClient`), reads request cookies, used only in `proxy.ts` and any future route handlers.

---

## Environment Variables

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → Publishable (anon) key |

Both are safe to expose in the browser bundle. Never use the Secret key on the client side.
