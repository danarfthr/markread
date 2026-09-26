<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# markread

Single-page, fully client-side Markdown viewer. Next.js 16 (App Router, Turbopack)
+ React 19 + Tailwind v4, deployed to Vercel. No backend, no database, no env vars.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml` is committed). Do not add
`package-lock.json` or `yarn.lock`.

```
pnpm dev      # dev server
pnpm lint     # ESLint (flat config)
pnpm build    # production build; also typechecks and regenerates route types
```

- **There is no test suite.** Do not add a test runner unless asked.
- **`next lint` does not exist in Next 16** — `package.json` maps `lint` to `eslint`
  directly. `npx next lint` fails with "Invalid project directory".
- Verify changes with `pnpm lint && pnpm build`.

### Typecheck gotcha

`src/app/layout.tsx` uses the generated `LayoutProps<"/">` type. Those types live in
`.next/types`, which is gitignored, so **`tsc --noEmit` fails on a fresh clone**:

```
src/app/layout.tsx(22,50): error TS2304: Cannot find name 'LayoutProps'.
```

Run `pnpm build` once first to generate them, then `tsc` passes. Never "fix" this by
inlining a hand-written props type.

## DESIGN.md is the source of truth

`DESIGN.md` defines the visual system. `src/app/globals.css` implements it as
Tailwind v4 `@theme` tokens. Read DESIGN.md before any UI change.

**The token block in DESIGN.md's "Quick Start -> Tailwind v4" section must NOT be
copied literally.** Four lines in it are real bugs; `globals.css` deliberately
renames them and documents why. Do not "restore" them to match the doc:

| DESIGN.md | Problem | Actual token |
|---|---|---|
| `--radius-full: 80px` | Tailwind consults `staticValues` only *after* theme resolution, so this silently redefines `rounded-full` from a pill to 80px | `--radius-cards: 80px` |
| `--radius-full-2: 100px` | confusing name | `--radius-pills: 100px` |
| `--spacing-4: 4px` … | Tailwind's `--spacing` is a 4px *multiplier*, so `p-4` would mean 4px instead of 16px — a silent 4x error | omit; use the native scale (`p-12` = 48px) |
| `--page-max-width: 1200px` | not a Tailwind namespace, so `max-w-page` resolves to nothing | `--container-page: 1200px` |

Also: line-height and tracking must be attached as `--text-*--line-height` /
`--text-*--letter-spacing` pairs. DESIGN.md's standalone `--leading-*` / `--tracking-*`
keys are not bundled into `text-*`, so the mandated display line-height of exactly
`1.0` would silently not apply.

`--font-t1-sans` is declared in a separate `@theme inline` block because it
references `--font-inter`, a runtime variable injected by `next/font`.

### Hard design rules (easy to violate)

- **T1 Sans is proprietary and not installable.** Inter is loaded via `next/font/google`
  as the substitute DESIGN.md sanctions. Do not try to fetch T1 Sans.
- **Shadowless.** No `shadow-*` utilities, ever. Hierarchy comes from tonal layering
  (vellum -> white -> carbon -> onyx), not elevation.
- **Weights stay at 300/400.** Headlines are weight 300 — never bold or semibold.
  The only exception is weight 500 on inline `<strong>` and table headers, where
  emphasis needs one step of differentiation.
- **Monochrome.** No accent colors, gradients, or decorative hues.
- **`--color-pure-black` is for SVG fills only** — never text, backgrounds or borders.
  Use `carbon-warm` (#322d2a) or `onyx-depth` (#0f0e12).
- **Radii:** images `rounded-cards` (80px), buttons/pills `rounded-pills` (100px),
  nothing below `rounded-small` (8px).
- **Section labels** always take the 4px solid square prefix (see
  `src/components/section-label.tsx`), not a dot or icon. No emoji or icons in labels.
- Section gap 48px, card padding 22px.

## Architecture

- `src/app/page.tsx` — Server Component; composes nav, hero, viewer, footer.
- `src/components/site-nav.tsx` — `'use client'`; floating pill nav with an
  `IntersectionObserver` scroll-spy. Three nested layers, all load-bearing:
  - The **outer div is sticky but transparent**, so the pill floats over content
    instead of sitting on a full-width band. DESIGN.md line 178: *"a floating dark
    pill anchored to the top of the viewport, not a full-width bar."*
  - That wrapper is `pointer-events-none`. **Do not remove it** — without it the
    wrapper becomes an invisible full-width strip that swallows every click in the
    top ~108px of the page. The `<nav>` restores `pointer-events-auto`.
  - Sticky must stay on the **outer** wrapper: `position: sticky` is bounded by its
    containing block, so a `w-fit` pill in a self-sized wrapper would never move.
  - The pill is `w-fit` and right-aligned to the content column. Do not give it
    `max-w-page`, which is what made it a full-width bar.
  - Because the nav is sticky, **every anchor target needs `scroll-mt-32`**, or the
    nav covers the heading the jump lands on. The band is ~108px; `scroll-mt-32`
    (128px) leaves 20px of clearance.
  - Nav links carry `min-h-11` (44px) — keep that, it is the touch-target minimum.
- `src/components/markdown-viewer.tsx` — `'use client'`; owns paste/drop state and
  renders the preview. Must stay a client component (`useState`, drag events).
  Choose file / Clear live in a toolbar **above** the panes, not below them, so the
  actions stay reachable without scrolling past the whole editor.

### The preview is memoized on purpose — do not "simplify" it

`react-markdown` does **not** memoize internally: it calls `createProcessor()`
inside its own component body, so every render re-parses the whole document
synchronously. Measured ~108 ms per parse at 100 KB and ~1 s at 1 MB, and the
file cap is 5 MB.

That made this a real bug, not a micro-optimization: while `<Markdown>` was
inline in `MarkdownViewer`, *any* state change re-parsed the document —
including toggling the drag overlay, which has nothing to do with the text.
Measured on a 100 KB document, six drag enter/leave pairs blocked the main
thread 12 times for 3.6 s total, and a single keystroke on 200 KB took ~1100 ms
to paint.

Three parts, all load-bearing:

1. `MarkdownPreview` is a module-level `memo()` component. Do not inline it back
   into `MarkdownViewer`.
2. `REMARK_PLUGINS` is at module scope. An inline `[remarkGfm]` is a new array
   each render, and `memo()` compares shallowly — a fresh reference silently
   defeats the memoization entirely.
3. `useDeferredValue(source)` feeds the preview, and `wordCount` derives from
   the deferred value too, so the count can never disagree with the preview
   beside it. Both the memo **and** the deferred value are needed: the deferred
   value alone still re-parses on every render, and the memo alone still blocks
   the keystroke.

After the fix: keystroke echo on 200 KB went 1100 ms → 22 ms, and drag toggling
produced zero long tasks. Verified by A/B against the pre-fix build with the
Long Tasks API; not covered by any test suite, so **re-measure if you touch it**.

`useDeferredValue` makes the parse non-blocking, not free — a large document
still blocks the thread for the duration of the deferred parse. Fixing that
properly needs a Web Worker, which `react-markdown` cannot support as-is
because it is coupled to React. React Compiler is **not** installed, so this
manual memoization is required; if you ever enable it, re-measure rather than
deleting these on the assumption the compiler covers it.
- `src/lib/sample-markdown.ts` — the initial document shown on load.
- Rendered Markdown is styled by the scoped `.markdown-body` layer in `globals.css`.
  `react-markdown` emits bare elements with no class hooks, so styling them via a
  scoped element ruleset is intentional — a `components` map would be far more verbose.
  Add new element styles there rather than inline classes.

### Do not add `rehype-raw`

Markdown arrives from the user, so it is untrusted. `rehype-raw` would allow raw HTML
and open an XSS hole in a deployed page. Keep the renderer limited to
`react-markdown` + `remark-gfm`. Window-level `dragover`/`drop` are cancelled in
`markdown-viewer.tsx` so dropping a file does not make the browser navigate away.

## Deploy

Vercel auto-detects Next.js. No `vercel.json` and no build config are needed.
Do not add `output: 'export'` — the app is already fully static (`○ (Static)` for `/`).

## Gotchas

- `create-next-app` writes its own `AGENTS.md` (the managed block above). Re-scaffolding
  overwrites this file. `next dev` merges its block back in via `upsertFile`, so edit
  around the markers rather than deleting them.
- `next-env.d.ts` is gitignored; do not commit it.
- `pnpm-workspace.yaml` only holds `allowBuilds` pins. It is not a monorepo.
- Remote images render through `<img>`, so no `next/image` domains config is required.
  Do not switch to `next/image` without adding `images.remotePatterns`.
