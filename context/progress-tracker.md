# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Active Development

## Current Goal

- Feature 06: Project API routes complete on branch prisma-integration

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
- Implemented Feature 06: Project REST API routes (branch: prisma-integration):
  - `app/api/projects/route.ts` — GET lists the authenticated user's projects ordered by createdAt desc; POST creates a project with name defaulting to "Untitled Project" if omitted/blank
  - `app/api/projects/[projectId]/route.ts` — PATCH renames, DELETE removes; both verify ownerId matches authenticated userId before mutating
  - 401 returned for unauthenticated requests on all four routes; 403 for non-owner mutations; 404 when project does not exist

- Implemented Feature 07: Wire editor home to real project API (branch: feature/07-wire-editor-home):
  - `lib/projects.ts` — `Project` interface + `getOwnedProjects(userId)` + `getSharedProjects(email)` Prisma helpers
  - `app/api/projects/route.ts` — POST handler now accepts an optional client-supplied `id` to keep project DB ID and Liveblocks room ID aligned
  - `hooks/use-project-actions.ts` — replaces mock `useProjectDialogs`; manages dialog state and calls real `POST/PATCH/DELETE /api/projects` endpoints; create generates `slug-suffix` room ID and navigates to new workspace; rename refreshes; delete redirects to `/editor` if active project else refreshes
  - `components/editor/project-sidebar.tsx` — updated to accept `ownedProjects`/`sharedProjects` props directly, imports `Project` from `lib/projects`
  - `components/editor/editor-home.tsx` — new client component owning sidebar toggle state + all dialogs wired to `useProjectActions`
  - `app/editor/page.tsx` — converted to server component: fetches owned and shared projects server-side via Prisma, renders `<EditorHome>`
  - Deleted `hooks/use-project-dialogs.ts` and `lib/mock-projects.ts` (replaced by real data)

- Implemented Feature 08: Editor workspace shell (branch: feature/07-wire-editor-home):
  - `lib/project-access.ts` — `getCurrentUser()` returns `{ userId, email }` from Clerk; `getProjectIfAccessible(projectId, userId, email)` returns `{ id, name }` if the user is owner or collaborator, null otherwise
  - `components/editor/access-denied.tsx` — centered layout with Lock icon, short message, and "Back to projects" link to `/editor`
  - `components/editor/project-sidebar.tsx` — added `activeRoomId?: string` prop; active project highlighted with `bg-elevated`
  - `components/editor/editor-navbar.tsx` — added optional `projectName`, `isAiSidebarOpen`, `onToggleAiSidebar` props; workspace view shows project name in center and disabled Share + AI sidebar toggle in right section
  - `components/editor/workspace-shell.tsx` — client component owning sidebar/AI sidebar toggle state and all project dialogs; full-viewport layout with canvas placeholder and collapsible AI sidebar placeholder
  - `app/editor/[roomId]/page.tsx` — server component: unauthenticated users redirect to `/sign-in`; missing/inaccessible projects render `AccessDenied`; accessible projects render `WorkspaceShell` with server-fetched project lists

## In Progress

- None

## Next Up

- Feature 09 (check context/feature-specs/ for next spec)

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
