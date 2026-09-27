/*
 * Tone, not a className escape hatch: DESIGN.md makes the 4px square prefix
 * mandatory on every section label, so the one thing a caller must never be
 * able to do is restyle the label into something that drops the square. Both
 * tones ship the square; only the color changes.
 */
const TONE = {
  dark: { text: "text-carbon-warm", square: "bg-carbon-warm" },
  light: { text: "text-paper-white", square: "bg-paper-white" },
} as const;

export function SectionLabel({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  /** Use `light` on Onyx Depth or any other dark surface. */
  tone?: keyof typeof TONE;
}) {
  return (
    <p
      className={`flex items-center gap-2 text-label font-normal uppercase tracking-[0.12em] ${TONE[tone].text}`}
    >
      {/* The signature 4px machined square — replaces conventional bullets. */}
      <span
        aria-hidden
        className={`block size-1 shrink-0 ${TONE[tone].square}`}
      />
      {children}
    </p>
  );
}
