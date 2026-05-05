# TruffleNation

A full-stack premium truffle marketplace connecting foragers, commercial suppliers, restaurants, and culinary enthusiasts.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | npm workspaces (compatible with pnpm for local dev) |
| Backend | Node.js 20+, Express 5 |
| Database | PostgreSQL (Neon recommended) + Drizzle ORM |
| Auth | Clerk |
| Frontend | React 19, Vite, TailwindCSS v4, shadcn/ui |
| API layer | OpenAPI spec + Orval codegen (React Query hooks) |

## Project Structure

```
artifacts/
  api-server/       Express API — all routes under /api/
  trufflenation/    React + Vite frontend
lib/
  api-client-react/ Generated React Query hooks (from OpenAPI spec)
  api-spec/         OpenAPI spec + Orval codegen config
  api-zod/          Generated Zod schemas
  db/               Drizzle ORM schema + migrations
```

> **Package manager note:** The `package.json` files use standard npm workspace format — no pnpm-specific `catalog:` references or `workspace:*` protocol. This means both `npm install` (for deployment) and `pnpm install` (for local dev) work with the same files.

---

## Local Development

### Prerequisites

- **Node.js 20+**
- **pnpm 10+** — `npm install -g pnpm` (recommended for local dev; faster installs via cache)
- A **PostgreSQL** database (local or [Neon free tier](https://neon.tech))
- A **Clerk** account — [clerk.com](https://clerk.com) (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/your-org/trufflenation.git
cd trufflenation
pnpm install
```

> **Note:** `npm install` also works locally, but pnpm is recommended for its faster installs and better caching.

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection string, or local Postgres |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys → Secret keys |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys → Publishable key |

### 3. Push the database schema

```bash
pnpm db:push
# or: npm run db:push
```

This runs `drizzle-kit push` against your `DATABASE_URL`.

### 4. (Optional) Seed the database

```bash
pnpm db:seed
# or: npm run db:seed
```

This adds demo sellers and truffle product listings.

### 5. Start the development servers

Open two terminals:

```bash
# Terminal 1 — API server (http://localhost:8080)
PORT=8080 pnpm dev:api

# Terminal 2 — Frontend (http://localhost:3000, proxies /api → :8080)
PORT=3000 BASE_PATH=/ pnpm dev:web
```

Then open [http://localhost:3000](http://localhost:3000).

### Docker optional

You do **not** need Docker to run this project. Any reachable PostgreSQL instance works:

- local PostgreSQL service (Homebrew/Postgres.app/etc),
- hosted Postgres (Neon/Supabase/Railway),
- Docker Postgres (optional convenience only).

Just set `DATABASE_URL` in `.env`, then run:

```bash
npm run db:push
npm run db:seed
```

---

## Deployment on Render

This project deploys as a **single Render web service**. The Express server builds the frontend and serves it as static files in production.

### Step 1 — Create a Neon database

1. Go to [neon.tech](https://neon.tech) and create a free project.
2. Copy the connection string — you'll need it in Step 3.

### Step 2 — Push your code to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 3 — Create a Render web service

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Set the following:

| Setting | Value |
|---|---|
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build:prod` |
| **Start Command** | `npm run start` |

4. Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `PORT` | `8080` |
| `NODE_ENV` | `production` |
| `CLERK_SECRET_KEY` | From Clerk dashboard |
| `VITE_CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `VITE_CLERK_PROXY_URL` | `https://your-render-url.onrender.com/api/__clerk` |

5. Deploy — Render will install all packages, build both the API and frontend, then start the server.

### What `npm run build:prod` does

1. **Frontend**: runs `vite build` → static files output to `artifacts/trufflenation/dist/public/`
2. **API server**: runs `esbuild` → bundled server output to `artifacts/api-server/dist/`

In production, Express serves the compiled frontend files and sends `index.html` for any non-`/api` route (SPA fallback for client-side routing).

### Step 4 — Run the database migration

After the first deploy, push the schema once from your local machine:

```bash
DATABASE_URL="your-neon-connection-string" pnpm db:push
```

Or use Neon's SQL editor to verify the schema.

---

## Key Scripts

| Command | Description |
|---|---|
| `pnpm dev:api` / `npm run dev:api` | Start API server in development mode |
| `pnpm dev:web` / `npm run dev:web` | Start frontend dev server |
| `npm run build:prod` | Build frontend + API server for production |
| `npm run start` | Start API server in production (serves frontend too) |
| `pnpm db:push` / `npm run db:push` | Sync Drizzle schema to the database |
| `pnpm codegen` / `npm run codegen` | Regenerate API client hooks from OpenAPI spec |
| `pnpm typecheck` / `npm run typecheck` | Run TypeScript checks across all packages |

---

## Presentation Guide

### What to demo (5-8 minutes)

1. **Landing + Catalog**
   - Show featured listings, filters, and category browsing.
   - Mention API-backed inventory and live query filtering.
2. **Guide + Seasonal Map + Videos**
   - Open `/truffles`, `/truffle-map`, `/truffles/videos`.
   - Explain educational content + global season planning.
3. **Auth + Buyer Flow**
   - Sign in, add to cart, complete checkout form.
   - Show orders list and order detail.
4. **Order cancellation**
   - Demonstrate buyer cancel (pending/confirmed only).
   - Mention seller fulfillment updates and server-side guardrails.
5. **Support pages**
   - Show shipping policy, authenticity guarantee, and contact page.

### Technical highlights

- Monorepo with npm workspaces (`artifacts/*`, `lib/*`, `scripts`)
- React 19 + Vite frontend, Tailwind v4 + shadcn/ui components
- Express 5 API with typed request/response schemas from OpenAPI
- React Query hooks generated via Orval (`@workspace/api-client-react`)
- Drizzle ORM + PostgreSQL for schema and data access
- Clerk authentication for protected buyer/seller routes

### Map note

Current implementation uses Leaflet + OpenStreetMap (free and simple).  
If you want more polished vector maps and smoother styling control, **MapLibre GL** is the best next upgrade path.

---

## Environment Variables Reference

See [`.env.example`](./.env.example) for the full list with descriptions.

---

## Regenerating the API client

If you change the OpenAPI spec at `lib/api-spec/openapi.yaml`:

```bash
pnpm codegen
# or: npm run codegen
```

This regenerates the React Query hooks in `lib/api-client-react/src/generated/` and the Zod schemas in `lib/api-zod/src/generated/`.
