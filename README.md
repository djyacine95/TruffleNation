# TruffleNation

A full-stack premium truffle marketplace connecting foragers, commercial suppliers, restaurants, and culinary enthusiasts.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
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

---

## Local Development

### Prerequisites

- **Node.js 20+**
- **pnpm 10+** — `npm install -g pnpm`
- A **PostgreSQL** database (local or [Neon free tier](https://neon.tech))
- A **Clerk** account — [clerk.com](https://clerk.com) (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/your-org/trufflenation.git
cd trufflenation
pnpm install
```

> **Note for Mac / Windows users:** The `pnpm-workspace.yaml` contains esbuild platform overrides that target Linux only (for the production environment). If `pnpm install` fails on your machine due to missing native binaries, remove the `overrides` block for `esbuild` from `pnpm-workspace.yaml`, then run `pnpm install` again. These overrides are safe to leave in place for Linux CI and production.

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
```

This runs `drizzle-kit push` against your `DATABASE_URL`.

### 4. (Optional) Seed the database

```bash
pnpm --filter @workspace/db run seed
```

This adds 3 demo sellers and 8 truffle product listings.

### 5. Start the development servers

Open two terminals:

```bash
# Terminal 1 — API server (http://localhost:8080)
PORT=8080 pnpm dev:api

# Terminal 2 — Frontend (http://localhost:3000, proxies /api → :8080)
PORT=3000 pnpm dev:web
```

Then open [http://localhost:3000](http://localhost:3000).

---

## Deployment on Render

This project is designed to deploy as a **single Render web service**. The Express server builds the frontend and serves it as static files, so you only need one service.

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
| **Build Command** | `pnpm install --frozen-lockfile && pnpm build:prod` |
| **Start Command** | `pnpm start` |

4. Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `PORT` | `8080` |
| `NODE_ENV` | `production` |
| `CLERK_SECRET_KEY` | From Clerk dashboard |
| `VITE_CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `VITE_CLERK_PROXY_URL` | `https://your-render-url.onrender.com/api/__clerk` |

5. Deploy — Render will install, build both the API and frontend, and start the server.

### What `pnpm build:prod` does

1. **Frontend**: runs `vite build` → outputs static files to `artifacts/trufflenation/dist/public/`
2. **API server**: runs `esbuild` → outputs bundled server to `artifacts/api-server/dist/`

In production, Express serves the frontend static files and handles the SPA fallback (all non-`/api` routes return `index.html`).

### Step 4 — Run the database migration

After the first deploy, run the schema push once from your local machine pointing at the production database:

```bash
DATABASE_URL="your-neon-connection-string" pnpm db:push
```

Or use Neon's SQL editor to verify the schema is correct.

---

## Key npm Scripts

| Command | Description |
|---|---|
| `pnpm dev:api` | Start API server in development mode |
| `pnpm dev:web` | Start frontend dev server |
| `pnpm build:prod` | Build frontend + API server for production |
| `pnpm start` | Start API server in production (serves frontend too) |
| `pnpm db:push` | Sync Drizzle schema to the database |
| `pnpm codegen` | Regenerate API client hooks from OpenAPI spec |
| `pnpm typecheck` | Run TypeScript checks across all packages |

---

## Environment Variables Reference

See [`.env.example`](./.env.example) for the full list with descriptions.

---

## Regenerating the API client

If you change the OpenAPI spec at `lib/api-spec/openapi.yaml`:

```bash
pnpm codegen
```

This regenerates the React Query hooks in `lib/api-client-react/src/generated/` and the Zod schemas in `lib/api-zod/src/generated/`.
