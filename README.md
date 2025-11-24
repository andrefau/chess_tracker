# Chess Tracker

A modern, premium-styled web application for tracking office chess games. It calculates Elo ratings, tracks weekly statistics, and displays a live scoreboard.

## Features

- **Live Scoreboard**: Real-time leaderboard with Elo ratings and weekly stats (Wins/Losses/Draws).
- **Elo Rating System**: Automatic calculation of player ratings based on match results.
- **Weekly Resets**: Win/Loss/Draw stats and Elo ratings reset weekly.
- **Match History**: View past matches with options to edit or delete results.
- **Auto-Recalculation**: Editing history automatically replays all matches to ensure accurate Elo ratings.
- **Premium UI**: Dark mode design with glassmorphism effects and responsive layout.

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: SQLite
- **ORM**: [Prisma](https://www.prisma.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd chess_tracker
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    ```bash
    cp .env.example .env
    ```

4.  Initialize the database:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  Run the development server:
    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components (Scoreboard, Button, Input, etc.).
- `src/lib`: Utility functions (Elo calculation, Prisma client).
- `prisma`: Database schema and migrations.

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm start`: Start production server.
- `npx prisma studio`: Open database GUI.
