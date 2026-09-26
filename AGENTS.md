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
- `src/components/markdown-viewer.tsx` — `'use client'`; owns paste/drop state and
  renders the preview. Must stay a client component (`useState`, drag events).
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
