# Markread

Markread renders Markdown as you paste it, and it runs entirely in your browser. There is no backend, no database, and no upload: your document never leaves the tab.

## Requirements

- **Node.js**: 20.9.0 or later. Next.js 16 requires it.
- **pnpm**: the repository pins 12.5.1 in `package.json` and commits `pnpm-lock.yaml`, so use pnpm rather than npm or yarn.

## Getting started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Starts the development server on port 3000 |
| `pnpm lint` | Runs ESLint with the flat config |
| `pnpm build` | Builds for production, typechecks, and regenerates route types |
| `pnpm start` | Serves the production build |

The project has no test suite, so verify changes with `pnpm lint && pnpm build`.

## How it works

- `src/app/page.tsx` composes the page: navigation, hero, viewer, and footer. It is a Server Component.
- `src/components/markdown-viewer.tsx` owns paste and drop state and renders the preview. It is a Client Component, because it needs `useState` and drag events.
- `src/lib/sample-markdown.ts` holds the document that loads on first visit.
- `src/app/globals.css` defines the Tailwind v4 design tokens and styles the rendered Markdown through a scoped `.markdown-body` layer.

The preview is memoized on purpose. `react-markdown` re-parses the whole document on every render, so the component, the plugin array, and `useDeferredValue` work together to keep typing responsive. `AGENTS.md` records the measurements and the reasoning.

Dropped and selected files load through the File API and cap at 5 MB.

## Deploy

Vercel detects Next.js and needs no configuration. The page is fully static, so leave `output: 'export'` out of `next.config.ts`.

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for other targets.
