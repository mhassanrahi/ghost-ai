# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Active Development

## Current Goal

- Feature 05: Prisma integration complete on branch prisma-integration

## Completed

- Installed and configured shadcn/ui v4 (Next.js 16 + Tailwind CSS v4, components.json created)
- Added shadcn components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea
- Installed lucide-react
- Created lib/utils.ts with cn() helper (clsx + tailwind-merge)
- Wrote full dark theme CSS token system in app/globals.css:
  - 17 Ghost AI raw tokens (--bg-base through --state-warning)
  - 17 @theme inline mappings generating Tailwind utilities (bg-base, bg-surface, text-copy-primary, text-brand, bg-accent-dim, border-surface-border, etc.)
  - shadcn semantic tokens (--background, --foreground, etc.) set to dark values in :root
  - Dark-only: no .dark class required
- TypeScript (tsc --noEmit) and Next.js build (npm run build) both pass cleanly
- Created `components/editor/editor-navbar.tsx`:
  - Fixed-height (h-12) top navbar, z-20
  - Left section: sidebar toggle with PanelLeftOpen / PanelLeftClose icon based on state
  - Center and right sections present, empty for now
  - `bg-surface` background, `border-surface-border` bottom border
  - Accepts `isSidebarOpen: boolean` and `onToggleSidebar: () => void` props
- Created `components/editor/project-sidebar.tsx`:
  - Floating overlay sidebar (fixed position, z-10), does not push page content
  - Slides in from left via `translate-x` transition (200ms ease-in-out)
  - Starts at top-12 (below navbar), spans to bottom
  - Width: w-72 (288px), `bg-surface/95 backdrop-blur-md` for depth
  - Header: "Projects" title + X close button
  - shadcn Tabs: "My Projects" | "Shared", both with empty placeholder state
  - Full-width "New Project" button with Plus icon at bottom
  - Accepts `isOpen: boolean` and `onClose: () => void` props
- Implemented Clerk authentication (Feature 03):
  - Installed `@clerk/ui`
  - Added `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` to `.env.local`
  - Created `proxy.ts` at project root with protected-first route protection (all routes protected except `/`, `/sign-in`, `/sign-up`)
  - Wrapped root layout with `ClerkProvider` using `@clerk/ui/themes` dark theme and CSS variable overrides (no hardcoded colors)
  - Updated `/` to redirect authenticated users to `/editor`, unauthenticated to `/sign-in`
  - Created `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` with two-panel layout (left panel hidden on mobile via `lg:` prefix)
  - Shared `components/auth/auth-layout.tsx` for both auth pages
  - Added `UserButton` to editor navbar right section
- Implemented Feature 04: Project dialogs and sidebar actions (branch: feature/04-project-dialogs):
  - `lib/mock-projects.ts` — `Project` interface + 3 mock entries (2 owned, 1 shared)
  - `lib/slug.ts` — `toSlug` utility (lowercase, hyphenated, sanitized)
  - `hooks/use-project-dialogs.ts` — single hook owns dialog state, form state, isLoading, mock CRUD
  - `components/editor/create-project-dialog.tsx` — name input + live slug preview, disabled until name is non-empty
  - `components/editor/rename-project-dialog.tsx` — prefilled input, autoFocus, Enter submits, current name in description
  - `components/editor/delete-project-dialog.tsx` — destructive confirm only, no input
  - `components/editor/project-sidebar.tsx` — ProjectItem with group-hover rename/delete (owned only), mobile backdrop scrim (z-[9], sm:hidden), shared projects use same ProjectItem (isOwned guard hides actions)
  - `app/editor/page.tsx` — editor home screen (heading + description + New Project button), all three dialogs mounted at root, sidebar and dialogs wired to useProjectDialogs hook
- Implemented Feature 05: Prisma integration (branch: prisma-integration):
  - `prisma/models/project.prisma` — `Project` model (ownerId, name, optional description, ProjectStatus enum DRAFT/ARCHIVED, canvasJsonPath, timestamps, indexes on ownerId and createdAt) and `ProjectCollaborator` model (projectId cascade-delete relation, email, createdAt, unique on projectId+email, indexes on email and projectId+createdAt)
  - Migration `20260603163344_init_projects` applied to Prisma Postgres
  - Client generated to `app/generated/prisma/` via `prisma-client` generator
  - `lib/prisma.ts` — cached singleton; branches on `DATABASE_URL`: `prisma+postgres://` uses `accelerateUrl` + `@prisma/extension-accelerate`, all other URLs use `@prisma/adapter-pg` with a `pg.Pool`; cached on `globalThis.prisma` in development

## In Progress

- None

## Next Up

- Feature 06 (check context/feature-specs/ for next spec)

## Open Questions

- None at this stage.

## Architecture Decisions

- Dark-only app: shadcn's :root semantic tokens are set directly to dark values; no .dark class or theme toggle needed.
- components/ui/* are never modified; all theming comes from globals.css CSS variables.
- cn() is the sole class-merge helper; import from @/lib/utils.
- shadcn/ui v4 uses Base UI primitives (@base-ui/react) instead of Radix UI — this is upstream and expected.
- Tailwind CSS v4 uses @theme inline (no tailwind.config.js); token mapping done entirely in globals.css.

## Session Notes

- shadcn@latest v4.10.0 was used; it auto-installs lucide-react, tw-animate-css, and shadcn/tailwind.css.
- globals.css was rewritten after shadcn init to set authoritative dark values and add Ghost AI custom tokens.
- All components/ui/* files are generated by shadcn CLI and must not be hand-edited.
- Font fix applied: --font-sans mapped to var(--font-geist-sans) to avoid circular self-reference.
