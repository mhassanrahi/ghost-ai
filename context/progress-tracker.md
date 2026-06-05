# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Active Development

## Current Goal

- Feature 11: Base canvas complete on branch feature/07-wire-editor-home

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

- Implemented Feature 09: Share dialog (branch: feature/07-wire-editor-home):
  - `lib/project-access.ts` — `getProjectIfAccessible` now returns `isOwner: boolean` alongside `id` and `name`
  - `lib/clerk-users.ts` — `enrichEmailsWithClerk(emails)` looks up each email via Clerk Backend SDK and returns `{ displayName, imageUrl }` per email, with null fallback for unknown users
  - `app/api/projects/[projectId]/collaborators/route.ts` — GET lists collaborators (accessible by owner and collaborators); POST invites by email (owner only, upsert to avoid duplicates); DELETE removes by email from request body (owner only)
  - `hooks/use-share-dialog.ts` — manages open state, collaborator list, invite email, copy-link feedback, and all three mutations
  - `components/editor/share-dialog.tsx` — dialog with copy-link row, invite form (owner only), scrollable collaborator list with inline avatars (Clerk image or initials fallback) and remove buttons (owner only)
  - `components/editor/editor-navbar.tsx` — added `onOpenShare?` prop; Share button now calls it instead of being disabled
  - `components/editor/workspace-shell.tsx` — added `isOwner` prop; mounts `useShareDialog` and `ShareDialog`
  - `app/editor/[roomId]/page.tsx` — passes `isOwner={project.isOwner}` to `WorkspaceShell`

- Implemented Feature 10: Liveblocks realtime collaboration infrastructure (branch: feature/07-wire-editor-home):
  - `liveblocks.config.ts` — updated Presence (cursor `{ x, y } | null`, `isThinking: boolean`) and UserMeta (`id`, `info.name`, `info.avatar`, `info.color`)
  - `lib/liveblocks.ts` — cached `Liveblocks` node client singleton (dev-safe via `globalThis`); `userIdToColor(userId)` deterministically maps a user ID to one of 12 fixed palette colors via a simple hash
  - `app/api/liveblocks-auth/route.ts` — `POST /api/liveblocks-auth`; requires Clerk auth (401 otherwise); reads `room` from request body and verifies access via `getProjectIfAccessible` (403 if denied); calls `getOrCreateRoom` to ensure the room exists; returns an ID-token session with `name`, `avatar`, and `color` attached as `userInfo`
  - Installed `@liveblocks/node` (was missing from dependencies despite spec stating packages were pre-installed)
  - Added `LIVEBLOCKS_SECRET_KEY=sk_` placeholder to `.env.local` — **must be replaced with actual key from Liveblocks dashboard**

- Implemented Feature 11: Base canvas (branch: feature/07-wire-editor-home):
  - `types/canvas.ts` — `NodeData` interface (label, color, shape) + `EdgeData` interface; `CanvasNode` and `CanvasEdge` type aliases using `@xyflow/react` Node/Edge generics
  - `components/editor/canvas-flow.tsx` — client component calling `useLiveblocksFlow` (suspense mode, empty initial nodes/edges); renders `ReactFlow` with dot-pattern `Background`, `MiniMap`, `Cursors`, loose connection mode, and `fitView`
  - `components/editor/canvas-wrapper.tsx` — client component mounting `LiveblocksProvider` (auth: `/api/liveblocks-auth`) + `RoomProvider` (room ID from prop, initial presence `cursor: null, isThinking: false`); wraps `CanvasFlow` in `ErrorBoundary` + `ClientSideSuspense` with loading and error fallback UI
  - `components/editor/workspace-shell.tsx` — canvas placeholder replaced with `<CanvasWrapper roomId={project.id} />`

- Implemented Feature 12: Shape panel (branch: feature/07-wire-editor-home):
  - `types/canvas.ts` — added `NodeShape` union type (rectangle, diamond, circle, pill, cylinder, hexagon); expanded `NodeData.shape` to use it; added `NODE_SHAPES` record with per-shape default dimensions (rect wider than tall, circle square, diamond taller for label room); added `NODE_COLORS` array (8 dark fill + contrasting text pairs from ui-context) and `DEFAULT_NODE_COLOR` constant
  - `components/editor/canvas-node.tsx` — new `CanvasNodeComponent` registered as `canvasNode` node type; renders bordered rectangle with centered label, 4 source handles (top/right/bottom/left hidden by React Flow until hover), fill/text colors resolved from `NODE_COLORS` lookup, cyan border on selection
  - `components/editor/shape-panel.tsx` — floating `<Panel position="bottom-center">` pill toolbar inside the ReactFlow canvas; 6 draggable buttons using Lucide icons (RectangleHorizontal, Diamond, Circle, Pill, Cylinder, Hexagon); `onDragStart` encodes `{ shape, width, height }` as JSON in `application/ghost-ai-shape` data transfer
  - `components/editor/canvas-flow.tsx` — updated to register `nodeTypes`, capture `ReactFlowInstance` via `onInit` for coordinate conversion; `onDragOver` enables drop; `onDrop` parses payload, converts screen→flow position via `rfInstance.screenToFlowPosition`, creates node with empty label + default color + dragged shape, and adds it via `onNodesChange([{ type: "add", item }])`; `<ShapePanel>` mounted inside `<ReactFlow>` children

- Implemented Feature 13: Node shape rendering and drag preview (branch: main):
  - `components/editor/canvas-node.tsx` — shape rendering was already complete from Feature 12: rectangle/circle/pill via CSS (rounded classes), diamond/hexagon/cylinder via SVG with `preserveAspectRatio="none"` scaling; subtle `#2a2a30` border at rest, cyan `#00c8d4` when selected
  - `components/editor/shape-panel.tsx` — added `ShapeDragPreview` component: renders the correct CSS or SVG shape at the cursor position as a `fixed`-position, `pointer-events: none` element via `createPortal` to `document.body`; `ShapePanel` tracks drag state (shape + cursor coords) via `onDragStart`/`onDrag`/`onDragEnd`; native browser drag ghost suppressed via `setDragImage(new Image(), 0, 0)`; preview cleared on drop or cancel

- Implemented Feature 14: Node resizing and inline label editing (branch: main):
  - `components/editor/canvas-node.tsx` — added `NodeResizer` (from `@xyflow/react`) to every shape branch; `isVisible={selected}`, per-shape minimum sizes in `SHAPE_MIN`, subtle cyan line/handle styles; added `editing`/`draft` local state + `useReactFlow().updateNodeData()` for committing label changes; `onDoubleClick` enters edit mode; a `textarea` with `nodrag nopan` classes overlays the node during editing; blur and Escape commit; SVG shape text elements hidden during editing and positioned after `</svg>` for correct stacking; placeholder text shown at 30% opacity when label is empty and not editing

- Implemented Feature 15: Node color toolbar (branch: main):
  - `components/editor/canvas-node.tsx` — added `ColorSwatch` helper component (manages own hover state, renders a 16×16 circular swatch with active border + tight glow via `box-shadow`); added `colorToolbar` using `NodeToolbar` from `@xyflow/react` (`position={Position.Top}`, `offset={8}`, `isVisible={selected}`); toolbar is a pill container with 8 swatches from `NODE_COLORS`; `nodrag nopan` + `stopPropagation` on all swatch interactions prevents canvas drag/pan; clicking a swatch calls `updateNodeData(id, { color: fill })`; text color is derived from the fill lookup so both update atomically; all shape branches wrapped in Fragment to include the toolbar

- Implemented Feature 18: Starter template library (branch: control-bar):
  - `components/editor/starter-templates.ts` — `CanvasTemplate` interface + `n()`/`e()` helper functions + three pre-built templates: Microservices Architecture (API gateway → services → DBs), CI/CD Pipeline (developer → git → CI → test/build → registry → staging → production), Event-Driven System (producers → event bus → consumers → data store)
  - `components/editor/starter-templates-modal.tsx` — shadcn `Dialog` with scrollable 3-column card grid; each card shows template name, description, lightweight SVG preview (bounds-fitted, edges as lines, nodes as colored SVG shapes by type), and "Use Template" button; preview is pure SVG with no React Flow instance
  - `components/editor/canvas-flow.tsx` — added `pendingTemplate` + `onTemplateImported` props; `useEffect` fires on non-null `pendingTemplate` to remove all existing nodes/edges then add template nodes/edges via `useLiveblocksFlow` change handlers; calls `fitView({ duration: 300 })` after import; uses refs to avoid stale closures
  - `components/editor/canvas-wrapper.tsx` — threads `pendingTemplate` + `onTemplateImported` props through to `CanvasFlow`
  - `components/editor/editor-navbar.tsx` — added `onOpenTemplates?` prop; "Templates" button with `LayoutTemplate` icon rendered left of Share when prop is present
  - `components/editor/workspace-shell.tsx` — added `isTemplatesOpen` + `pendingTemplate` state; mounts `StarterTemplatesModal`; `handleTemplateImport` closes modal and sets pending template; `CanvasWrapper` receives pending template and resets it on import

- Implemented Feature 17: Canvas ergonomics (branch: main):
  - `components/editor/canvas-controls.tsx` — floating pill control bar at `bottom-left`; zoom out / fit view / zoom in buttons wired to `rfInstance` with 300ms animation; undo / redo buttons wired to Liveblocks `useUndo`/`useRedo`; disabled state uses `useCanUndo`/`useCanRedo`; disabled buttons at 30% opacity; thin vertical divider separates zoom and history groups
  - `hooks/useKeyboardShortcuts.ts` — `useKeyboardShortcuts({ rfInstance, onUndo, onRedo })` hook; listens on `window` `keydown`; skips `input`, `textarea`, and `contentEditable` targets; shortcuts: `+`/`=` zoom in, `-` zoom out, `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` redo, `Ctrl/Cmd+Y` redo
  - `components/editor/canvas-flow.tsx` — removed `MiniMap`; imported and called `useKeyboardShortcuts`; mounted `CanvasControls` inside `<ReactFlow>`

- Implemented Feature 16: Edge behavior (branch: nodes-color-toolbar):
  - `types/canvas.ts` — added `label?: string` to `EdgeData`
  - `app/globals.css` — added React Flow handle overrides: 10×10 white circular dots with dark border, `opacity: 0` by default, faded in on `.react-flow__node:hover`, `.selected`, and during active connections
  - `components/editor/canvas-edge.tsx` — new `CanvasEdgeComponent` registered as `canvasEdge` type; uses `getSmoothStepPath` for right-angle routing; wide (20px) transparent hitbox path overlaid on a thin (1.5px) visible path for easy clicking; per-edge SVG `<marker>` defs (dim `#808090` / bright `#f0f0f4`) switched on hover or selection; `EdgeLabelRenderer` positions label at path midpoint (`labelX`/`labelY` from `getSmoothStepPath`); double-click opens a `ch`-width auto-growing input; blur/Enter/Escape commit via `updateEdgeData` → `onEdgesChange` → Liveblocks sync; saved labels shown as pill badges; faint "Add label…" hint shown on active unlabeled edges; all label interactions carry `nodrag nopan` + `stopPropagation`
  - `components/editor/canvas-flow.tsx` — added `edgeTypes = { canvasEdge: CanvasEdgeComponent }` and `defaultEdgeOptions = { type: "canvasEdge", data: {} }`; both wired into `<ReactFlow>` so all new connections use the custom renderer

## In Progress

- None

## Next Up

- Feature 19 (check context/feature-specs/ for next spec)

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
