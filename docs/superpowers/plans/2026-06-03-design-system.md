# Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install and configure shadcn/ui with all required components, lucide-react, and a dark-only token system that aligns with the Ghost AI design language.

**Architecture:** shadcn/ui components live in `components/ui/` (generated, never modified). The design theme is declared entirely in `app/globals.css` using Tailwind v4's `@theme inline` + CSS custom properties. The `cn()` utility in `lib/utils.ts` is the sole helper for class merging across all app-level components.

**Tech Stack:** Next.js 16.2.7 (App Router), Tailwind CSS v4, shadcn/ui (latest), lucide-react, clsx, tailwind-merge, class-variance-authority

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `components.json` | shadcn CLI configuration (created by `shadcn init`) |
| Create | `lib/utils.ts` | `cn()` class-merge helper (created by `shadcn init`) |
| Create | `components/ui/button.tsx` | shadcn Button (generated — do not edit) |
| Create | `components/ui/card.tsx` | shadcn Card (generated — do not edit) |
| Create | `components/ui/dialog.tsx` | shadcn Dialog (generated — do not edit) |
| Create | `components/ui/input.tsx` | shadcn Input (generated — do not edit) |
| Create | `components/ui/tabs.tsx` | shadcn Tabs (generated — do not edit) |
| Create | `components/ui/textarea.tsx` | shadcn Textarea (generated — do not edit) |
| Create | `components/ui/scroll-area.tsx` | shadcn ScrollArea (generated — do not edit) |
| Modify | `app/globals.css` | Full dark theme: `@theme inline` mappings + CSS variables |
| Modify | `context/progress-tracker.md` | Reflect completed design system work |

---

## Task 1: Run shadcn init

**Files:**
- Create: `components.json`
- Create: `lib/utils.ts`
- Modify: `app/globals.css` (shadcn appends CSS vars — we replace this in Task 3)

- [ ] **Step 1: Run shadcn init with defaults**

```bash
npx shadcn@latest init -d
```

Expected output includes:
```
✔ Preflight checks.
✔ Verifying framework. Found Next.js.
✔ Validating Tailwind CSS.
✔ Writing components.json.
✔ Checking registry.
✔ Updating app/globals.css
✔ Installing dependencies.
✔ Created 1 file:
  - lib/utils.ts
```

If it asks interactively, answer:
- Style: **Default**
- Base color: **Neutral**
- CSS variables: **Yes**

- [ ] **Step 2: Verify components.json was created**

```bash
cat components.json
```

Expected: a JSON file containing `"style": "default"`, `"rsc": true`, `"tsx": true`, and `"tailwind": { "css": "app/globals.css", "cssVariables": true }`.

- [ ] **Step 3: Verify lib/utils.ts was created**

```bash
cat lib/utils.ts
```

Expected content:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

If the file is missing or different, write it manually:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Commit**

```bash
git add components.json lib/utils.ts
git commit -m "chore: initialize shadcn/ui"
```

---

## Task 2: Install lucide-react

**Files:** (no file changes — npm install only)

- [ ] **Step 1: Install lucide-react**

```bash
npm install lucide-react
```

Expected output ends with `added N packages` and no errors.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lucide-react"
```

---

## Task 3: Add all shadcn components

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/dialog.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/tabs.tsx`
- Create: `components/ui/textarea.tsx`
- Create: `components/ui/scroll-area.tsx`

- [ ] **Step 1: Add all seven components in one command**

```bash
npx shadcn@latest add button card dialog input tabs textarea scroll-area --yes
```

Expected output:
```
✔ Checking registry.
✔ Installing dependencies.
✔ Created 7 files:
  - components/ui/button.tsx
  - components/ui/card.tsx
  - components/ui/dialog.tsx
  - components/ui/input.tsx
  - components/ui/tabs.tsx
  - components/ui/textarea.tsx
  - components/ui/scroll-area.tsx
```

The command may also install additional peer deps (e.g. `@radix-ui/react-dialog`, `@radix-ui/react-scroll-area`, `@radix-ui/react-tabs`). This is expected.

- [ ] **Step 2: Verify all seven files exist**

```bash
ls components/ui/
```

Expected: `button.tsx  card.tsx  dialog.tsx  input.tsx  scroll-area.tsx  tabs.tsx  textarea.tsx` (plus any utility files shadcn creates).

- [ ] **Step 3: Commit**

```bash
git add components/ui/ package.json package-lock.json
git commit -m "feat: add shadcn/ui components (button, card, dialog, input, tabs, textarea, scroll-area)"
```

---

## Task 4: Rewrite globals.css with the complete dark theme

**Files:**
- Modify: `app/globals.css`

shadcn init will have modified `globals.css`. We replace its content entirely with the authoritative dark-only theme. This file is NOT a generated `components/ui/*` file, so it IS safe to modify.

- [ ] **Step 1: Replace app/globals.css with the full dark theme**

Write the following as the complete content of `app/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  /* Shadcn semantic mappings — keep these so components/ui/* work */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  /* Ghost AI custom tokens */
  --color-base: var(--bg-base);
  --color-surface: var(--bg-surface);
  --color-elevated: var(--bg-elevated);
  --color-subtle: var(--bg-subtle);
  --color-surface-border: var(--border-default);
  --color-surface-border-subtle: var(--border-subtle);
  --color-copy-primary: var(--text-primary);
  --color-copy-secondary: var(--text-secondary);
  --color-copy-muted: var(--text-muted);
  --color-copy-faint: var(--text-faint);
  --color-brand: var(--accent-primary);
  --color-accent-dim: var(--accent-primary-dim);
  --color-ai: var(--accent-ai);
  --color-ai-text: var(--accent-ai-text);
  --color-error: var(--state-error);
  --color-success: var(--state-success);
  --color-warning: var(--state-warning);
}

@layer base {
  :root {
    /* Shadcn semantic tokens — set to dark values (dark-only app, no .dark class needed) */
    --background: #111114;
    --foreground: #f0f0f4;
    --card: #18181c;
    --card-foreground: #f0f0f4;
    --popover: #18181c;
    --popover-foreground: #f0f0f4;
    --primary: #00c8d4;
    --primary-foreground: #080809;
    --secondary: #1e1e23;
    --secondary-foreground: #f0f0f4;
    --muted: #1e1e23;
    --muted-foreground: #808090;
    --accent: #1e1e23;
    --accent-foreground: #f0f0f4;
    --destructive: #ff4d4f;
    --border: #2a2a30;
    --input: #2a2a30;
    --ring: #00c8d4;
    --radius: 0.75rem;

    /* Ghost AI raw tokens */
    --bg-base: #080809;
    --bg-surface: #111114;
    --bg-elevated: #18181c;
    --bg-subtle: #1e1e23;
    --border-default: #2a2a30;
    --border-subtle: #3a3a42;
    --text-primary: #f0f0f4;
    --text-secondary: #c0c0cc;
    --text-muted: #808090;
    --text-faint: #505060;
    --accent-primary: #00c8d4;
    --accent-primary-dim: rgba(0, 200, 212, 0.12);
    --accent-ai: #6457f9;
    --accent-ai-text: #8b82ff;
    --state-error: #ff4d4f;
    --state-success: #34d399;
    --state-warning: #fbbf24;
  }

  * {
    border-color: var(--border-default);
  }

  body {
    background-color: var(--bg-base);
    color: var(--text-primary);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: add dark theme CSS tokens to globals.css"
```

---

## Task 5: Verify — TypeScript compilation

**Files:** (read-only verification, no changes)

- [ ] **Step 1: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Expected: exits with code 0 and no output. Any errors indicate a missing import or type mismatch to fix before proceeding.

- [ ] **Step 2: Run Next.js build**

```bash
npm run build
```

Expected: build completes with `✓ Compiled successfully` (or similar). No missing module errors. The build output will list the generated routes.

- [ ] **Step 3: If tw-animate-css error appears**

If the build fails with `Cannot find module 'tw-animate-css'`, it means shadcn init added an import to `globals.css` that we need to remove. Open `app/globals.css` and delete the line:

```css
@import "tw-animate-css";
```

Then re-run `npm run build`.

- [ ] **Step 4: Commit fix if needed**

```bash
git add app/globals.css
git commit -m "fix: remove tw-animate-css import not present in project"
```

---

## Task 6: Update progress-tracker.md

**Files:**
- Modify: `context/progress-tracker.md`

- [ ] **Step 1: Write updated progress-tracker.md**

Replace the content of `context/progress-tracker.md` with:

```markdown
# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Complete

## Current Goal

- Design system and UI primitives (Feature 01)

## Completed

- Installed and configured shadcn/ui (Next.js 16 + Tailwind CSS v4)
- Added shadcn components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea
- Installed lucide-react
- Created lib/utils.ts with cn() helper (clsx + tailwind-merge)
- Wrote full dark theme CSS token system in app/globals.css:
  - Shadcn semantic mappings via @theme inline (so components/ui/* work)
  - Ghost AI custom tokens: bg-base, bg-surface, bg-elevated, bg-subtle,
    border-default, border-subtle, text-primary, text-secondary, text-muted,
    text-faint, accent-primary, accent-primary-dim, accent-ai, accent-ai-text,
    state-error, state-success, state-warning
  - @theme inline maps all tokens to Tailwind utilities

## In Progress

- None.

## Next Up

- Feature 02 (check context/feature-specs/)

## Open Questions

- None at this stage.

## Architecture Decisions

- Dark-only: shadcn's :root variables are set to dark values directly; no .dark class required.
- components/ui/* are never modified; theme comes entirely from globals.css CSS variables.
- cn() is the sole class-merge helper; import from @/lib/utils.

## Session Notes

- shadcn@latest was initialized with -d (defaults), Tailwind v4 detected automatically.
- globals.css was rewritten after shadcn init to provide authoritative token values.
- All components/ui/* files are generated and must not be hand-edited.
```

- [ ] **Step 2: Commit**

```bash
git add context/progress-tracker.md
git commit -m "docs: update progress tracker — design system complete"
```

---

## Self-Review Against Spec

Spec requirements vs plan coverage:

| Requirement | Covered in |
|-------------|-----------|
| Install and configure shadcn/ui | Task 1 |
| Add Button | Task 3 |
| Add Card | Task 3 |
| Add Dialog | Task 3 |
| Add Input | Task 3 |
| Add Tabs | Task 3 |
| Add Textarea | Task 3 |
| Add ScrollArea | Task 3 |
| Do not modify components/ui/* | Noted in Task 3; components are committed as-is |
| Install lucide-react | Task 2 |
| Create lib/utils.ts with cn() | Task 1 (shadcn creates it; Task 1 Step 3 verifies/fixes) |
| Components match dark theme | Task 4 (globals.css maps all shadcn vars to dark values) |
| All components import without errors | Task 5 (tsc --noEmit + build) |
| cn() works properly | Task 5 (tsc --noEmit verifies types compile) |
| No default light styling | Task 4 (:root uses dark values; no .dark class required) |

No gaps found.
