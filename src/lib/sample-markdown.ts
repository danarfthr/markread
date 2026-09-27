export const SAMPLE_MARKDOWN = `# Markdown viewer

Paste Markdown into the Source pane, or drop a \`.md\` file onto either pane.
Everything renders locally in your browser: nothing is uploaded.

## Formatting

Text can be **emphasized**, *italicized*, ~~struck through~~, or \`inline code\`.
Links look like [example.com](https://example.com).

> Blockquotes render with a hairline rule.

## Lists

- Unordered items
- With a second entry
  - And a nested one

1. Ordered items
2. Work the same way

- [x] Task lists render checkboxes
- [ ] Including unchecked ones

## Code

\`\`\`ts
type Viewer = {
  source: string;
  onSourceChange: (next: string) => void;
};

export function render({ source }: Viewer) {
  return source.trim().length > 0;
}
\`\`\`

## Tables

| Token | Value | Role |
|-------|-------|------|
| Vellum | \`#f0efe9\` | Page canvas |
| Carbon Warm | \`#322d2a\` | Text and borders |
| Onyx Depth | \`#0f0e12\` | Darkest surface |

---

Images render with the 80px radius:

![Placeholder](https://placehold.co/1200x400/f0efe9/322d2a?text=Markread)
`;
