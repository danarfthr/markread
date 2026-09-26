"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#viewer", label: "Viewer" },
  { href: "#format", label: "Format" },
] as const;

export function SiteNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = LINKS.map((link) =>
      document.getElementById(link.href.slice(1)),
    ).filter((element): element is HTMLElement => element !== null);

    if (targets.length === 0) return;

    // A narrow band near the top of the viewport decides which section counts
    // as current, so a link lights up once its heading has actually passed
    // under the sticky nav rather than the moment the section enters view.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    // Sticky, and opaque vellum so scrolled content is hidden behind the band
    // instead of showing through the gap around the floating pill.
    <div className="sticky top-0 z-50 w-full bg-vellum px-4 pt-6 pb-3 sm:px-6">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-page items-center justify-between gap-2 rounded-nav bg-carbon-warm px-4 py-3.5 sm:gap-6 sm:px-6"
      >
        <span className="flex items-center gap-2 text-body-sm text-paper-white">
          <span aria-hidden className="block size-1 shrink-0 bg-paper-white" />
          Markread
        </span>
        <ul className="flex items-center gap-1 text-body-sm text-paper-white sm:gap-4">
          {LINKS.map((link) => {
            const isActive = active === link.href;
            return (
              <li key={link.href}>
                {/* min-h-11 keeps the tap target at 44px on touch screens. */}
                <a
                  href={link.href}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => setActive(link.href)}
                  className={`flex min-h-11 items-center rounded-buttons px-3 underline-offset-4 transition-opacity hover:underline ${
                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
