import { MarkdownViewer } from "@/components/markdown-viewer";
import { SectionLabel } from "@/components/section-label";
import { SiteNav } from "@/components/site-nav";

export default function Home() {
  return (
    <>
      <SiteNav />

      <main className="flex flex-1 flex-col">
        <header className="mx-auto w-full max-w-page px-6 pt-24 pb-12">
          <SectionLabel>Markdown viewer</SectionLabel>
          <h1 className="mt-6 max-w-3xl text-display text-carbon-warm">
            Read Markdown the way a specification sheet reads.
          </h1>
          <p className="mt-6 max-w-xl text-body text-carbon-warm">
            A single page that renders Markdown as you paste it. Everything runs
            in your browser — no upload, no account, no server.
          </p>
        </header>

        <MarkdownViewer />

        <section
          id="format"
          className="mx-auto w-full max-w-page scroll-mt-32 px-6 pt-12 pb-24"
        >
          <SectionLabel>Format</SectionLabel>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: "Paste",
                body: "Drop text straight into the source pane and the preview updates as you type.",
              },
              {
                title: "Drop a file",
                body: "Drag a .md, .markdown or .mdx file anywhere onto the page to load it.",
              },
              {
                title: "GitHub flavored",
                body: "Tables, task lists, strikethrough and fenced code are all supported.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-body border border-carbon-warm bg-paper-white p-[22px]"
              >
                <h2 className="text-subheading text-carbon-warm">
                  {item.title}
                </h2>
                <p className="mt-2 text-body-sm text-carbon-warm">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/*
       * The footer is the page's terminator, so it carries display-scale type
       * rather than a single row of small print. Structure follows the
       * reference site's contact section: label, display headline, body copy,
       * then a hairline-separated bottom bar.
       *
       * DESIGN.md's footer constraints are preserved — Onyx Depth surface, 30px
       * bottom padding, 14px text in the bottom bar. Only the top padding grows
       * (48px -> 80/112px) to give the display headline room to breathe.
       */}
      <footer className="w-full bg-onyx-depth px-6 pt-20 pb-[30px] md:pt-28">
        <div className="mx-auto w-full max-w-page">
          <SectionLabel tone="light">Markread</SectionLabel>

          <h2 className="mt-8 max-w-3xl text-display-fluid font-light text-paper-white">
            Nothing leaves your browser.
          </h2>

          <p className="mt-8 max-w-xl text-body text-mercury">
            Close the tab and the document is gone. There is no upload, no
            account, and no server behind this page.
          </p>

          {/* border-carbon-warm is the dark-surface hairline; mercury text
              clears AA contrast on onyx at 5.6:1. */}
          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-carbon-warm pt-6">
            <p className="text-body-sm text-mercury">
              Made by{" "}
              <a
                href="https://danar.app"
                target="_blank"
                rel="noreferrer noopener"
                className="underline underline-offset-4 transition-colors hover:text-paper-white"
              >
                danar.app
              </a>
            </p>
            <a
              href="#top"
              className="text-body-sm text-mercury transition-colors hover:text-paper-white"
            >
              Back to top
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
