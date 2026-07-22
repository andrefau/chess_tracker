# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npx prisma migrate dev --name <name>  # Create and apply a new migration
npx prisma studio    # Open database GUI
npx prisma generate  # Regenerate Prisma client after schema changes
```

No test framework is set up. Verification scripts live in `scripts/` and can be run with `npx ts-node scripts/<file>.ts`.

## Architecture

**Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, SQLite via Prisma ORM.

**Database schema** (`prisma/schema.prisma`): Two models — `User` (id, name, currentElo starting at 1200) and `Match` (playerAId, playerBId, result as `"A_WON" | "B_WON" | "DRAW"`, date). PlayerA = white pieces, PlayerB = black pieces.

**Elo system:**
- K-factor is 96 (high, to make ratings more volatile).
- `src/lib/elo.ts` — pure calculation function.
- `src/lib/recalculate.ts` — full replay: resets all users to 1200 and replays every match in chronological order. This is called on every edit or delete of a match to ensure consistency. New matches update Elo incrementally via the POST handler.

**API routes** (`src/app/api/`):
- `GET /api/scoreboard` — computes weekly stats (W/L/D, weekly Elo starting from 1200) for the current week (Mon–Sun). Players with 0 games are pushed to the bottom. Accepts optional `?date=` to view other weeks.
- `GET/POST /api/matches` — list matches (optionally filtered by week via `?date=`) or create a new match.
- `PUT/DELETE /api/matches/[id]` — edit result or delete a match; both trigger `recalculateAllElos()`.
- `GET /api/users` / `GET/DELETE /api/users/[id]` — user CRUD.
- `GET /api/fun-facts` — returns a randomly selected Norwegian-language fun fact generated from match statistics (win streaks, head-to-head records, etc.).

**Pages:**
- `/` — main scoreboard with weekly leaderboard and fun fact ticker.
- `/match/new` — register a new match result.
- `/user/new` — add a new player.
- `/history` — browse and edit/delete past matches.
- `/player/[id]` — individual player stats with Elo history graph (`EloGraph.tsx`).

**UI components** (`src/app/components/`): `Scoreboard`, `EloGraph`, `FunFact`, `RegisterMatchButton`, `WeeklySummaryModal`, `ConfirmationModal`, plus primitives in `ui/` (Button, Input, Select). The app is Norwegian-language (nynorsk) throughout (UI text, fun facts).

**Environment:** `DATABASE_URL` in `.env` points to the SQLite file (`prisma/dev.db`). Copy `.env.example` to `.env` on fresh setup.
