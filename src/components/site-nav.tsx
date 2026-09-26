export function SiteNav() {
  return (
    <div className="w-full pt-6">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-page items-center justify-between gap-6 rounded-nav bg-carbon-warm px-6 py-3.5"
      >
        <span className="flex items-center gap-2 text-body-sm text-paper-white">
          <span aria-hidden className="block size-1 shrink-0 bg-paper-white" />
          Markread
        </span>
        <ul className="flex items-center gap-6 text-body-sm text-paper-white">
          <li>
            <a className="underline-offset-4 hover:underline" href="#viewer">
              Viewer
            </a>
          </li>
          <li>
            <a className="underline-offset-4 hover:underline" href="#format">
              Format
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
