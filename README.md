# Ghost AI

**Ghost AI** is a real-time collaborative system design workspace. Describe a software architecture in plain English, let the AI generate it as an interactive graph on a shared canvas, refine it with your team, and export a production-ready technical specification — all without leaving your browser.

## Demo

Click [here](https://ghost-ai-de.vercel.app/) to see a live demo of the application.

---

## Key Features

### Collaboration (powered by Liveblocks)
- **Live multi-user canvas** — Multiple users edit the same architecture graph simultaneously with zero conflicts
- **Real-time presence** — See collaborators' live cursors and avatar indicators on the canvas
- **Instant sync** — All node and edge changes propagate to every participant in real time
- **Shared room model** — Liveblocks rooms are scoped per project with membership-verified access tokens

### AI & Background Processing (powered by Trigger.dev)
- **AI architecture generation** — Describe a system in natural language; a durable background task writes structured nodes and edges directly into the shared canvas room
- **Spec generation** — Convert the current canvas graph into a Markdown technical specification via a resilient background job
- **Durable execution** — Long-running AI tasks survive network interruptions, retries, and timeouts without blocking the UI
- **Task status tracking** — Run records are persisted in the database so generation progress is always visible

### Project Management
- **Authentication & route protection** via Clerk
- **Project ownership and collaborator access** — invite teammates to any project
- **Starter template library** — import prebuilt architecture patterns (monolith, microservices, event-driven, serverless, and more) into the canvas at any time
- **Spec storage and download** — generated Markdown specs are stored in Vercel Blob and linked to your project

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js 16 (App Router)             │
│  ┌──────────────┐   ┌──────────────┐  ┌──────────────┐  │
│  │  UI / Pages  │   │  API Routes  │  │   Server     │  │
│  │  (React 19)  │   │  /app/api    │  │   Actions    │  │
│  └──────┬───────┘   └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼─────────────────┼──────────┘
          │                  │                 │
          ▼                  ▼                 ▼
  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐
  │  Liveblocks   │  │  Trigger.dev │  │  Prisma /       │
  │  (React Flow) │  │  Background  │  │  PostgreSQL     │
  │               │  │  Tasks       │  │                 │
  │ • Live canvas │  │              │  │ • Projects      │
  │ • Cursors     │  │ • AI design  │  │ • Collaborators │
  │ • Presence    │  │   generation │  │ • Specs         │
  │ • Node/edge   │  │ • Spec       │  │ • Task runs     │
  │   sync        │  │   generation │  │                 │
  └───────────────┘  └──────┬───────┘  └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Vercel Blob    │
                    │ • Canvas JSON   │
                    │ • Markdown specs│
                    └─────────────────┘
```

### How the pieces interact

| Concern | Handled by |
|---|---|
| Routing, SSR, and API endpoints | Next.js App Router |
| User identity and session tokens | Clerk |
| Real-time canvas state and presence | Liveblocks rooms (token-gated per project) |
| AI prompt → canvas graph | Trigger.dev background task → writes to Liveblocks room |
| Canvas graph → Markdown spec | Trigger.dev background task → writes to Vercel Blob |
| Relational metadata | Prisma + PostgreSQL |
| Large artifact storage | Vercel Blob |

**Request flow for AI generation:**
1. User submits a prompt in the UI
2. Next.js API route validates auth, verifies project membership, and triggers a Trigger.dev task
3. The task runs durably in the background — calling the AI model, structuring the output, and writing nodes/edges into the Liveblocks room
4. Every collaborator sees the canvas update live as the task writes

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20`
- A **PostgreSQL** database
- Accounts for: [Clerk](https://clerk.com), [Liveblocks](https://liveblocks.io), [Trigger.dev](https://trigger.dev), [Vercel Blob](https://vercel.com/docs/storage/vercel-blob), and an AI provider (Google Gemini or OpenAI)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ghost-ai.git
cd ghost-ai

# 2. Install dependencies (also runs prisma generate via postinstall)
npm install

# 3. Copy the environment template
cp .env.example .env.local

# 4. Fill in your credentials in .env.local (see section below)

# 5. Push the database schema
npm exec prisma migrate deploy
```

### Environment Variables

Create a `.env.local` file at the root of the project. All variables are required unless marked optional.

```bash
# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/ghost_ai"

# ─── Clerk (Authentication) ───────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# ─── Liveblocks ───────────────────────────────────────────────────────────────
LIVEBLOCKS_SECRET_KEY="sk_..."
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY="pk_..."

# ─── Trigger.dev ──────────────────────────────────────────────────────────────
TRIGGER_SECRET_KEY="tr_dev_..."
NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY="pk_tr_..."

# ─── AI Providers ─────────────────────────────────────────────────────────────
GOOGLE_GENERATIVE_AI_API_KEY="AIza..."       # Google Gemini
OPENAI_API_KEY="sk-..."                      # OpenAI (optional fallback)

# ─── Vercel Blob (Artifact Storage) ───────────────────────────────────────────
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# ─── App ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> Copy this block into `.env.example` with empty values as a committed template for your team.

---

## Running the App Locally

Ghost AI requires **two processes** running simultaneously: the Next.js dev server and the Trigger.dev worker.

**Terminal 1 — Next.js**

```bash
npm run dev
```

**Terminal 2 — Trigger.dev worker**

```bash
npm run trigger:dev
# equivalent: npx trigger.dev@4.4.6 dev
```

The Trigger.dev CLI authenticates with `TRIGGER_SECRET_KEY`, connects to the Trigger.dev cloud, and begins executing background tasks locally. Any AI generation or spec generation task triggered from the UI will run inside this worker process.

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

### Next.js → Vercel

1. Push your repository to GitHub
2. Import the project in the [Vercel dashboard](https://vercel.com/new)
3. Add all environment variables from `.env.local` to the Vercel project settings (swap `test` keys for production keys)
4. The build command `prisma migrate deploy && next build` is already configured in `package.json`
5. Deploy

### Trigger.dev → Production

1. Log in to [cloud.trigger.dev](https://cloud.trigger.dev) and create a project
2. Copy your **production** `TRIGGER_SECRET_KEY` into Vercel's environment variables
3. Deploy your background tasks from the CLI:

```bash
npm run trigger:deploy
# equivalent: npx trigger.dev@4.4.6 deploy
```

Trigger.dev bundles and deploys your task definitions to their cloud infrastructure. They execute automatically whenever triggered from your deployed Next.js app — no extra server required.

### Pre-launch Checklist

- [ ] `DATABASE_URL` points to your production PostgreSQL instance
- [ ] `CLERK_SECRET_KEY` is the **production** key (not `test`)
- [ ] `LIVEBLOCKS_SECRET_KEY` is from your production Liveblocks project
- [ ] `BLOB_READ_WRITE_TOKEN` has write access to your Vercel Blob store
- [ ] Trigger.dev tasks are deployed (`npm run trigger:deploy`)
- [ ] Vercel build completes without errors

---

## Project Structure

```
ghost-ai/
├── app/                  # Next.js App Router — pages, layouts, API routes
│   └── api/              # Authenticated request handlers
├── components/           # UI components (canvas, sidebar, dialogs)
├── context/              # Project documentation and architecture decisions
├── lib/                  # Shared infrastructure (Prisma client, auth helpers)
├── prisma/               # Database schema and migrations
├── trigger/              # Trigger.dev background task definitions
└── public/               # Static assets
```

---

## License

MIT
