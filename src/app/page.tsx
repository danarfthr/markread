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

      <footer className="w-full bg-onyx-depth px-6 pt-12 pb-[30px]">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4">
          <p className="text-body-sm text-paper-white">Markread</p>
          <p className="text-body-sm text-paper-white">
            Rendered locally. Nothing leaves your browser.
          </p>
          <p className="text-body-sm text-paper-white">
            Made by{" "}
            <a
              href="https://danar.app"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-4"
            >
              danar.app
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
