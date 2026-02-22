# DailyMood

A mood journaling app that takes under 30 seconds to use. Pick a mood, add a note, and let the AI figure out your patterns.

Built by Yihan Wang and Kaichen Qu.

**[Live Demo](#)** · **[PRD](./docs/)** · **[Blog Post](#)**

![CI](https://img.shields.io/badge/build-passing-brightgreen) ![Coverage](https://img.shields.io/badge/coverage-80%25-green)

---

## What it does

Most journaling apps ask for too much. DailyMood keeps it to two steps: pick a mood from five options, optionally write a note. After five entries the AI starts surfacing patterns, including most common mood, weekly trends, likely triggers pulled from your notes. The insights dashboard shows a color-coded bar chart you can filter by 7, 30, or 90 days.

The core screens:

**Log**: mood picker + optional textarea. Save in under 30 seconds.

**Calendar**: monthly grid showing a mood emoji on each day you logged. Click a date to expand the full entry.

**Insights**: stats cards, bar chart, and the AI card (unlocks at 5 entries). Edit or delete any entry from here.

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Route Handlers (no separate server) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth — email/password + Google OAuth |
| AI | Anthropic API (`claude-haiku-4-5`) |
| Charts | Recharts |
| Testing | Vitest + React Testing Library, Playwright (E2E) |
| Deploy | Vercel |

---

## Getting started

You need Node 18+, a Supabase project, and an Anthropic API key.

```bash
git clone https://github.com/your-username/dailymood.git
cd dailymood
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Running tests

```bash
npm run test          # unit + integration (Vitest)
npm run test:coverage # same with coverage report
npm run test:e2e      # Playwright end-to-end
```

Coverage target is 80%. CI fails below that.

---

## Project structure

```
src/app/          Next.js pages and API route handlers
src/components/   UI components grouped by feature (mood, calendar, insights, ui)
src/hooks/        Data fetching hooks (useMoodEntries, useInsights)
src/lib/          Supabase clients, Anthropic client, moodUtils
src/types/        Shared TypeScript types
e2e/              Playwright specs
docs/sprints/     Sprint planning and retro notes
```

---

## Features

**Mood picker**: five emoji buttons (😄 😊 😐 😞 😢). One tap to select, save button activates. Works on mobile with 44px touch targets.

**Notes**: optional textarea, 500 character limit, counter turns red at 50 remaining.

**Calendar**: monthly grid, emoji on logged days, click to expand full entry.

**Insights dashboard**: bar chart (color-coded by mood score), average mood, top mood, entry count. Toggle between 7 / 30 / 90 day ranges.

**AI insights**: unlocks after 5 entries. Generates a trend summary and surfaces patterns from your notes. Cached once per day so it's not calling the API on every visit.

**Edit and delete**: edit any past entry in a modal, delete with a confirmation dialog. Both update the chart and AI card immediately.

---

## API

Two server-side endpoints. Both require a valid Supabase JWT in the `Authorization` header.

`POST /api/insights`: takes `{ userId, range }`, returns a structured summary (top mood, trend, triggers, narrative).

`POST /api/analyze-image`: takes `{ imageUrl }`, returns a short mood description from the image.

Full spec in `docs/openapi.yaml`.

---

## Sprints

Sprint docs are in `docs/sprints/`. Two sprints total.

Sprint 1 covered auth, mood picker, notes, calendar, and CI setup.
Sprint 2 covered AI insights, edit/delete, E2E tests, and production deploy.

---

## Out of scope

Social features, push notifications, multiple entries per day, data export, and multi-language support are not in this version.
