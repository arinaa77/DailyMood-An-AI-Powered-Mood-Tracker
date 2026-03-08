# DailyMood : API Documentation

DailyMood uses **Supabase** as its backend. All data operations go through the Supabase client SDK, which communicates with a PostgreSQL database via a REST API. There are no custom Express or Next.js route handlers in this version.

This document covers:
1. [Authentication](#1-authentication)
2. [Database Schema](#2-database-schema)
3. [Mood Entries : REST Endpoints](#3-mood-entries--rest-endpoints)
4. [Client Hook : `useMoodEntries`](#4-client-hook--usemoodentries)
5. [Real-time Subscription](#5-real-time-subscription)
6. [Utility Functions](#6-utility-functions)
7. [Component API Contracts](#7-component-api-contracts)
8. [Error Handling](#8-error-handling)

---

## 1. Authentication

All requests to the database are authenticated via a **Supabase JWT** issued at sign-in. The token is stored in a session cookie and refreshed automatically by `proxy.ts` on every request.

### Sign up

```ts
const { error } = await supabase.auth.signUp({ email, password });
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | `string` | Yes | Must be a valid email address |
| `password` | `string` | Yes | Minimum 6 characters |

**Success:** session cookie set, user redirected to `/log`.
**Error:** `authError.message` displayed in the form.

---

### Sign in

```ts
const { error } = await supabase.auth.signInWithPassword({ email, password });
```

Same fields as sign up. Returns a JWT session on success.

---

### Sign out

```ts
await supabase.auth.signOut();
```

Clears the session cookie and redirects to `/login`.

---

### Auth guard

`proxy.ts` runs on every request to `/(app)/` routes:
- No session → redirect to `/login`
- Valid session on `/login` → redirect to `/log`

---

## 2. Database Schema

### Table: `mood_entries`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary key, `gen_random_uuid()` | Unique entry identifier |
| `user_id` | `uuid` | `references auth.users(id) on delete cascade`, not null | Owner of the entry |
| `mood_score` | `integer` | `check (mood_score between 1 and 5)`, not null | Mood rating 1–5 |
| `note` | `text` | Default `''`, not null | Optional journal note |
| `created_at` | `timestamptz` | Default `now()`, not null | Entry timestamp |

### Row Level Security

RLS is enabled. The policy ensures users can only read and write their own rows:

```sql
create policy "Users own their entries"
  on mood_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

All queries in the app also include `.eq('user_id', user.id)` explicitly as a second safety layer.

### Mood Scale

| Score | Label | Emoji |
|---|---|---|
| 5 | Great | 😄 |
| 4 | Good | 🙂 |
| 3 | Okay | 😐 |
| 2 | Bad | 😞 |
| 1 | Awful | 😢 |

---

## 3. Mood Entries : REST Endpoints

Supabase exposes a REST API at `https://<project-id>.supabase.co/rest/v1/mood_entries`. The client SDK wraps these calls : you do not call them directly.

All requests require:
```
Authorization: Bearer <supabase-jwt>
apikey: <anon-key>
```

---

### GET : Fetch all entries for the current user

```
GET /rest/v1/mood_entries?user_id=eq.<user_id>&order=created_at.desc
```

**Response `200 OK`:**
```json
[
  {
    "id": "a1b2c3d4-...",
    "user_id": "u1u2u3...",
    "mood_score": 4,
    "note": "Good day overall.",
    "created_at": "2026-03-07T10:00:00.000Z"
  }
]
```

**SDK equivalent:**
```ts
const { data, error } = await supabase
  .from('mood_entries')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

---

### POST : Create a new entry

```
POST /rest/v1/mood_entries
Content-Type: application/json

{
  "user_id": "<user_id>",
  "mood_score": 4,
  "note": "Feeling good today."
}
```

**Response `201 Created`:**
```json
[
  {
    "id": "new-uuid",
    "user_id": "...",
    "mood_score": 4,
    "note": "Feeling good today.",
    "created_at": "2026-03-07T10:00:00.000Z"
  }
]
```

**SDK equivalent:**
```ts
const { error } = await supabase
  .from('mood_entries')
  .insert({ user_id: user.id, mood_score, note });
```

---

### PATCH : Update an existing entry

```
PATCH /rest/v1/mood_entries?id=eq.<entry_id>&user_id=eq.<user_id>
Content-Type: application/json

{
  "mood_score": 5,
  "note": "Updated note."
}
```

**Response `200 OK`:** empty array `[]`

**SDK equivalent:**
```ts
const { error } = await supabase
  .from('mood_entries')
  .update({ mood_score, note })
  .eq('id', id)
  .eq('user_id', user.id);
```

---

### DELETE : Remove an entry

```
DELETE /rest/v1/mood_entries?id=eq.<entry_id>&user_id=eq.<user_id>
```

**Response `200 OK`:** empty array `[]`

**SDK equivalent:**
```ts
const { error } = await supabase
  .from('mood_entries')
  .delete()
  .eq('id', id)
  .eq('user_id', user.id);
```

---

## 4. Client Hook : `useMoodEntries`

**Location:** `src/hooks/useMoodEntries.ts`
**Usage:** Import in any client component. Never import in server components or route handlers.

```ts
import { useMoodEntries } from '@/hooks/useMoodEntries';

const { entries, loading, error, createEntry, updateEntry, deleteEntry } = useMoodEntries();
```

### Return values

| Member | Type | Description |
|---|---|---|
| `entries` | `MoodEntry[]` | All entries for the signed-in user, ordered newest first |
| `loading` | `boolean` | `true` while the initial fetch is in flight |
| `error` | `string \| null` | Error message if the last fetch failed, otherwise `null` |
| `createEntry` | `(mood_score: number, note: string) => Promise<void>` | Insert a new entry |
| `updateEntry` | `(id: string, mood_score: number, note: string) => Promise<void>` | Update an entry by ID |
| `deleteEntry` | `(id: string) => Promise<void>` | Delete an entry by ID |

### Behaviour

- Fetches all entries on mount.
- All three mutation functions (`createEntry`, `updateEntry`, `deleteEntry`) refetch the full list after completing.
- All mutations **throw** on Supabase error : wrap calls in `try/catch` in the UI layer.
- Subscribes to Supabase Realtime for live updates (see [Section 5](#5-real-time-subscription)).

### Example

```tsx
function LogPage() {
  const { createEntry } = useMoodEntries();

  async function handleSave(mood: number, note: string) {
    try {
      await createEntry(mood, note);
    } catch (err) {
      console.error('Failed to save entry', err);
    }
  }

  return <MoodPicker onSave={handleSave} />;
}
```

---

## 5. Real-time Subscription

`useMoodEntries` subscribes to a Supabase Realtime channel that listens for any INSERT, UPDATE, or DELETE on the `mood_entries` table. When a change is detected, the hook automatically refetches the entry list.

```ts
const channel = supabase
  .channel('mood_entries_changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'mood_entries' },
    () => fetchEntries(),
  )
  .subscribe();
```

The channel is removed when the component unmounts to prevent memory leaks.

**Effect:** any entry saved in another browser tab appears in the current tab within ~1 second without a page refresh.

---

## 6. Utility Functions

**Location:** `src/lib/moodUtils.ts`

```ts
import { emojiFromScore, labelFromScore, colorFromScore } from '@/lib/moodUtils';
```

### `emojiFromScore(score: number): string`

Returns the emoji for a mood score.

| Input | Output |
|---|---|
| `5` | `"😄"` |
| `4` | `"🙂"` |
| `3` | `"😐"` |
| `2` | `"😞"` |
| `1` | `"😢"` |
| other | `"❓"` |

---

### `labelFromScore(score: number): string`

Returns the text label for a mood score.

| Input | Output |
|---|---|
| `5` | `"Great"` |
| `4` | `"Good"` |
| `3` | `"Okay"` |
| `2` | `"Bad"` |
| `1` | `"Awful"` |
| other | `"Unknown"` |

---

### `colorFromScore(score: number): string`

Returns a hex colour for use in charts and UI elements.

| Input | Output | Used for |
|---|---|---|
| `4–5` | `"#22c55e"` | Green : positive moods |
| `3` | `"#eab308"` | Yellow : neutral mood |
| `1–2` | `"#ef4444"` | Red : negative moods |
| other | `"#94a3b8"` | Gray : fallback |

---

## 7. Component API Contracts

### `<MoodPicker>`

```ts
interface MoodPickerProps {
  onSave: (mood_score: number, note: string) => Promise<void>;
}
```

Handles all internal state (selected mood, note text, loading, success banner). Calls `onSave` on submit and resets itself on success.

---

### `<CalendarGrid>`

```ts
interface CalendarGridProps {
  entries: MoodEntry[];
  month: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}
```

Pure display component : no data fetching. Renders a monthly grid with mood emojis on logged days.

---

### `<EntryDetail>`

```ts
interface EntryDetailProps {
  entry: MoodEntry | null;
  onEdit: () => void;
  onDelete: () => void;
}
```

Renders nothing when `entry` is `null`. Shows mood, timestamp, note, and Edit/Delete buttons.

---

### `<MoodBarChart>`

```ts
interface MoodBarChartProps {
  data: DailyMoodSummary[];
}
```

Pure display. Renders a Recharts bar chart coloured by mood score. Shows an empty state when `data` is empty.

---

### `<StatsCards>`

```ts
interface StatsCardsProps {
  entries: MoodEntry[];
}
```

Computes average mood, top mood, and entry count from `entries`. Shows dashes when empty.

---

### `<MilestoneCards>`

```ts
interface MilestoneCardsProps {
  entries: MoodEntry[];
}
```

Computes all-time personal records client-side: longest streak, current streak, best month (highest average), favorite mood, and total entries. Pass all entries (not range-filtered) for accurate all-time records.

---

### `<Modal>`

```ts
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

Closes on `Escape` key and backdrop click. Uses `role="dialog"` and `aria-modal="true"`.

---

## 8. Error Handling

| Scenario | Behaviour |
|---|---|
| Supabase fetch fails | `error` string set in `useMoodEntries`, displayed in UI |
| `createEntry` / `updateEntry` / `deleteEntry` fails | Function throws : caller catches and shows toast or alert |
| Unauthenticated request | `proxy.ts` redirects to `/login` before the page loads |
| Invalid `mood_score` | Database `check` constraint rejects the insert with a Supabase error |
| Auth error on sign-in | `authError.message` shown in the login form via `role="alert"` |
