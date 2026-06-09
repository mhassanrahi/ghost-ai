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

- Implemented Feature 20: AI sidebar shell (branch: main):
  - `components/editor/ai-sidebar.tsx` — new dedicated client component; floating fixed-right panel with 200ms slide-in/out transition via `translate-x`; header with `Bot` icon, "AI Workspace" title, "Collaborate with Ghost AI" subtitle, and close button; shadcn `Tabs` with "AI Architect" and "Specs" tabs using `bg-ai/10 text-ai-text` active styling; AI Architect tab: empty state with bot icon, description, and 3 starter chips (`bg-subtle text-ai-text`), scrollable message list with right-aligned user bubbles (`bg-accent-dim border-brand/50`) and left-aligned assistant bubbles (`bg-elevated border-surface-border text-ai-text`), auto-resizing `Textarea` (min 72px / max 160px), Enter-to-send / Shift+Enter-for-newline; Specs tab: "Generate Spec" button (`bg-ai text-white`), static demo spec card (`bg-elevated rounded-2xl`) with file icon, title, snippet, and disabled Download button
  - `components/editor/workspace-shell.tsx` — removed inline `<aside>` AI sidebar placeholder; imported and mounted `<AiSidebar isOpen={isAiSidebarOpen} onClose={...} />` as a floating overlay alongside other sidebar components

- Implemented Feature 21: Canvas autosave (branch: main):
  - `@vercel/blob` installed; `BLOB_READ_WRITE_TOKEN` already present in `.env.local`
  - `app/api/projects/[projectId]/canvas/route.ts` — GET reads `Project.canvasJsonPath` from Prisma and fetches the JSON from Vercel Blob; PUT uploads canvas JSON to Vercel Blob (`canvas/{projectId}/canvas.json`, `allowOverwrite: true`) and updates `canvasJsonPath` in Prisma; both endpoints enforce Clerk auth and project accessibility
  - `hooks/use-canvas-autosave.ts` — exports `SaveStatus` type (`idle | saving | saved | error`) and `useCanvasAutosave` hook; watches nodes/edges, debounces 2 s, skips when `enabled = false` or no user edits have occurred; reads latest nodes/edges via refs to avoid stale closures
  - `components/editor/canvas-flow.tsx` — added `projectId` and `onSaveStatusChange` props; `hasUserEdited` ref set by `handleNodesChange`/`handleEdgesChange` wrappers (gates autosave); mount-once effect checks room emptiness: if empty fetches GET canvas and loads it via `onNodesChange`/`onEdgesChange`, then sets `saveEnabled = true`; template import sets `hasUserEdited = true`; save status propagated via `onSaveStatusChange` callback
  - `components/editor/canvas-wrapper.tsx` — added `projectId` and `onSaveStatusChange` props, threaded to `CanvasFlow`
  - `components/editor/workspace-shell.tsx` — added `saveStatus` state; passes `projectId` and `onSaveStatusChange` to `CanvasWrapper`; passes `saveStatus` to `EditorNavbar`
  - `components/editor/editor-navbar.tsx` — added `saveStatus?: SaveStatus` prop; renders `Loader2`/`Check`/`AlertCircle` icon + label in center section (next to project name) when status is not `idle`

- Implemented Feature 19: Presence avatars and live cursors (branch: main):
  - `liveblocks.config.ts` — renamed `isThinking` to `thinking` in Presence type to match spec
  - `components/editor/canvas-wrapper.tsx` — updated `initialPresence` to use `thinking: false`
  - `components/editor/presence-avatars.tsx` — new component rendered as a React Flow `Panel position="top-right"` inside the canvas; uses `useOthers()` filtered by the current Clerk `userId` (from `useAuth()`) to exclude own connections; shows up to 5 collaborator avatars in an overlapping stack with `ring-2` for readability, profile photo or colored initials fallback; `+N` overflow chip when more than 5; vertical divider only when at least one collaborator is present; Clerk `UserButton` always shown last
  - `components/editor/canvas-flow.tsx` — added `LiveCursor` component using `useOther(connectionId, o => o.info)` to render a colored SVG pointer + name badge pill per participant; `cursorComponents` constant wires it into `<Cursors components={cursorComponents} />`; `<PresenceAvatars />` mounted inside `<ReactFlow>` children; cursor broadcasting is handled automatically by the Liveblocks `Cursors` component (reads/writes `presence.cursor` in React Flow canvas coordinates)

- Implemented Feature 22: Design Agent API (branch: trigger-dev):
  - `prisma/models/task-run.prisma` — `TaskRun` model (`runId` unique, `projectId`, `userId`, `createdAt`); index on `runId`, compound index on `userId`+`projectId`; migration `20260608111446_add_task_runs` applied
  - `trigger/design-agent.ts` — minimal `design-agent` task stub; accepts `{ prompt, roomId }`; logs payload and returns `{ received: true }`; no AI logic (superseded by Feature 23)
  - `app/api/ai/design/route.ts` — `POST /api/ai/design`; requires auth; validates `prompt`, `roomId`, `projectId`; verifies project access via `getProjectIfAccessible`; triggers `design-agent` task via `tasks.trigger`; persists `TaskRun` record; returns `{ runId }`
  - `app/api/ai/design/token/route.ts` — `POST /api/ai/design/token`; requires auth; accepts `{ runId }`; verifies `TaskRun` ownership; issues run-scoped public access token via `triggerAuth.createPublicToken`; returns `{ token }`

- Implemented Feature 23: Design Agent Logic (branch: trigger-dev):
  - `liveblocks.config.ts` — added `RoomEvent: { type: "AI_STATUS"; status: "start" | "processing" | "complete" | "error"; message: string }` for typed broadcasts
  - `trigger/design-agent.ts` — full AI agent: uses `@ai-sdk/google` Gemini 2.0 Flash + `generateObject` with structured Zod schema (7 action types: add/move/resize/update/delete node, add/delete edge); applies operations via `mutateFlow` from `@liveblocks/react-flow/node`; sets AI presence (`ghost-ai` user, `thinking: true`, TTL 120s) at start, clears on completion/error; broadcasts typed `AI_STATUS` room events at start/processing/complete/error; updates Trigger.dev run metadata at each step; error path uses `Promise.allSettled` for resilient cleanup
  - `components/editor/canvas-flow.tsx` — added `useEventListener` for `AI_STATUS` room events; renders a `<Panel position="top-center">` toast overlay visible to all room participants; auto-dismisses on complete/error with `useRef`-tracked timer and cleanup effect
  - `components/editor/ai-sidebar.tsx` — full rewrite: added `projectId`/`roomId` props; `sendMessage` now calls `POST /api/ai/design` then `POST /api/ai/design/token`; uses `useRealtimeRun<typeof designAgentTask>` with inline access token for per-user run tracking; `isThinking` message state shows `Loader2` spinner; covers all terminal `RunStatus` values including `PENDING_VERSION`; `runError` effect prevents permanent spinner lock on SSE failures
  - `components/editor/workspace-shell.tsx` — passes `projectId` and `roomId` to `AiSidebar`
  - `package.json` — added `zod` as direct dependency

- Implemented Feature 24: AI Presence State (branch: trigger-dev):
  - `types/tasks.ts` — `AiStatusFeedPayloadSchema` (Zod) + `AiStatusFeedPayload` type; validates incoming feed messages
  - `liveblocks.config.ts` — added `"ai-status-feed": AiStatusFeedPayload | null` to `Storage` type
  - `components/editor/workspace-shell.tsx` — moved `LiveblocksProvider` + `RoomProvider` here (with `initialStorage: { "ai-status-feed": null }`); both `CanvasFlow` and `AiSidebar` now share one room context
  - `components/editor/canvas-wrapper.tsx` — removed providers and `roomId` prop; now only wraps `CanvasFlow` in `ErrorBoundary` + `ClientSideSuspense`
  - `components/editor/canvas-flow.tsx` — `useMutation` writes to `ai-status-feed` when `AI_STATUS` room events arrive (clears to null on complete/error); `LiveCursor` shows `Loader2` spinner in name badge when `presence.thinking` is true
  - `components/editor/ai-sidebar.tsx` — `useStorage` subscribes to `ai-status-feed`; validates payload with `AiStatusFeedPayloadSchema`; `isGenerating` combines local `isSubmitting`/`activeRun` with shared feed status; header subtitle shows live feed text + spinner; textarea disabled and placeholder updated when shared generation is active; send button shows spinner when submitting

- Implemented Feature 25: Sidebar Chat Feed (branch: trigger-dev):
  - `types/tasks.ts` — added `AiChatMessageSchema` (Zod, fields: id, sender, role, content, timestamp) + `AiChatMessage` type
  - `liveblocks.config.ts` — added `"ai-chat": LiveList<AiChatMessage>` to `Storage` type; separate from `ai-status-feed`
  - `components/editor/workspace-shell.tsx` — imported `LiveList` from `@liveblocks/client`; added `"ai-chat": new LiveList([])` to `RoomProvider` `initialStorage`
  - `components/editor/ai-sidebar.tsx` — replaced local `messages` state with `useStorage` on `ai-chat`; validates each message via `AiChatMessageSchema.safeParse` before rendering; `pushMessage` mutation appends to `ai-chat`; sender name read from `useSelf`; user messages pushed to feed on send; AI responses pushed on run completion/error; thinking state stays local (transient); `ChatMessage` helper renders sender, timestamp, and bubble per message; `sendError` banner shown on failures

- Implemented Feature 27: Spec Generation Flow (branch: trigger-dev):
  - `trigger/generate-spec.ts` — `generateSpecTask` task; validates input with Zod (`projectId`, `roomId`, `chatHistory`, `nodes`, `edges`); builds a structured prompt from canvas state and conversation history; calls Gemini 2.0 Flash via `@ai-sdk/google` `generateText`; updates run metadata at each step (Analyzing → Generating → Complete); returns `{ spec: markdownContent }`
  - `app/api/ai/spec/route.ts` — `POST /api/ai/spec`; requires Clerk auth (401); accepts `roomId`, `chatHistory`, `nodes`, `edges`; resolves `projectId` from `roomId` via `getProjectIfAccessible` (never trusts client-supplied projectId); triggers `generate-spec` task; persists `TaskRun` record; returns `{ runId }`
  - `app/api/ai/spec/token/route.ts` — `POST /api/ai/spec/token`; requires Clerk auth; accepts `runId`; verifies `TaskRun` ownership; issues 1-hour Trigger.dev public access token scoped to that run; returns `{ token }`

- Implemented Feature 29: Spec UI Integration (branch: main):
  - `app/api/projects/[projectId]/specs/route.ts` — GET lists all `ProjectSpec` records for the authenticated user's project, ordered by `createdAt` desc; 401 for unauthenticated, 403 for inaccessible project
  - `components/editor/spec-preview-modal.tsx` — shadcn `Dialog`; fetches spec content via the existing download endpoint on open; renders Markdown with `react-markdown` + `remark-gfm`; download action via programmatic anchor click; close via X button or Escape
  - `components/editor/ai-sidebar.tsx` — Specs tab replaced: fetches real spec list when tab activates; scrollable compact list of `SpecListItem` rows (filename derived from `filePath`, formatted date, hover-reveal download button); clicking a row opens `SpecPreviewModal`; loading and empty states handled; `Generate Spec` static placeholder removed

- Implemented Feature 28: Spec Persistence & Download (branch: main):
  - `prisma/models/spec.prisma` — `ProjectSpec` model (`id`, `projectId`, `filePath`, `createdAt`; cascade-delete on project removal; index on `projectId`); migration `20260609141329_add_project_specs` applied
  - `prisma/models/project.prisma` — added `specs ProjectSpec[]` relation to `Project`
  - `trigger/generate-spec.ts` — after `generateText`, uploads Markdown to Vercel Blob at `specs/{projectId}/{timestamp}.md` (private, `text/markdown`); creates `ProjectSpec` record; returns `{ spec: text, specId: record.id }`
  - `app/api/projects/[projectId]/specs/[specId]/download/route.ts` — `GET`; requires Clerk auth (401); verifies project access via `getProjectIfAccessible` (403); fetches `ProjectSpec` by specId (404); cross-checks `spec.projectId === projectId` (403); fetches blob with auth header; returns content as `text/markdown` attachment (`Content-Disposition: attachment; filename="spec-{specId}.md"`)
  - `components/editor/canvas-flow.tsx` — fixed pre-existing TypeScript error: tightened `writeFeedStatus` mutation parameter from `{ status: string }` to `AiStatusFeedPayload | null`

- Implemented Feature 26: Design Agent Frontend (branch: trigger-dev):
  - `app/globals.css` — added `--accent-green: #62c073` raw token + `--color-accent-green` Tailwind mapping
  - `app/api/ai/design/route.ts` — generates public Trigger.dev token in same handler and returns `{ runId, publicToken }` in a single response; wraps `createPublicToken` in try/catch that returns `{ error, runId }` on failure so client can fall back to the token endpoint
  - `components/editor/ai-sidebar.tsx` — `sendMessage` reads `{ runId, publicToken }` from one API call; user bubbles styled `bg-accent-green text-copy-primary`; submit button uses `bg-accent-green text-copy-primary`; compact `isFeedActive` status strip (animated green dot + feed text) added above input; 500+runId partial failure handled gracefully

## In Progress

- None

## Next Up

- Check context/feature-specs/ for next spec

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
