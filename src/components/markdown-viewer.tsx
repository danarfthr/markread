"use client";

import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SAMPLE_MARKDOWN } from "@/lib/sample-markdown";
import { SectionLabel } from "@/components/section-label";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

/*
 * Module scope on purpose. An inline `[remarkGfm]` is a new array on every
 * render, and `memo()` compares props shallowly — a fresh reference would
 * defeat the memoization on MarkdownPreview below.
 */
const REMARK_PLUGINS = [remarkGfm];

/*
 * Split out and memoized because react-markdown is expensive and does NOT
 * memoize internally: it calls createProcessor() inside its own component body,
 * so every render re-parses the whole document synchronously. Measured ~108ms
 * per parse at 100KB and ~1s at 1MB.
 *
 * While this lived inline in MarkdownViewer, *any* state change re-parsed the
 * document — including toggling the drag overlay, which has nothing to do with
 * the text. Paired with useDeferredValue below, it now only re-renders when the
 * deferred text actually changes.
 *
 * Do not enable React Compiler and delete this: it is not installed, so manual
 * memoization is load-bearing.
 */
const MarkdownPreview = memo(function MarkdownPreview({
  source,
}: {
  source: string;
}) {
  if (source.trim().length === 0) {
    return <p className="text-body-sm text-mercury">Nothing to preview yet.</p>;
  }

  return (
    <article className="markdown-body">
      <Markdown remarkPlugins={REMARK_PLUGINS}>{source}</Markdown>
    </article>
  );
});

export function MarkdownViewer() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragDepth = useRef(0);

  /*
   * Keeps typing responsive on large documents. React renders the textarea's
   * new value immediately and re-renders the preview at a lower priority, so a
   * slow parse no longer blocks the keystroke that caused it.
   *
   * On first render (including SSR) deferredSource === source, so the server
   * HTML and the hydrated output are identical — no flicker, no mismatch.
   *
   * Note this makes the parse non-blocking, not free: a very large document
   * still blocks the main thread for the duration of the deferred parse. Moving
   * it to a Web Worker would fix that properly, but react-markdown is coupled
   * to React and cannot run off-thread without a different renderer.
   */
  const deferredSource = useDeferredValue(source);

  const readFile = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setError("That file is larger than 5 MB.");
      return;
    }
    try {
      setSource(await file.text());
      setError(null);
    } catch {
      setError("Your browser could not read that file.");
    }
  }, []);

  // Dropping on the window would otherwise make the browser navigate away to
  // the raw file, replacing the app entirely.
  useEffect(() => {
    const prevent = (event: DragEvent) => event.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) void readFile(file);
    },
    [readFile],
  );

  /*
   * Deferring the parse alone would leave the split() running synchronously on
   * every keystroke — ~6ms at 1MB, ~31ms at the 5MB cap. The count also derives
   * from the deferred value so it can never disagree with the preview beside it:
   * both describe the same rendered document, not the in-flight keystroke.
   */
  const isEmpty = deferredSource.trim().length === 0;
  const wordCount = useMemo(
    () => (isEmpty ? 0 : deferredSource.trim().split(/\s+/).length),
    [deferredSource, isEmpty],
  );

  return (
    <section
      id="viewer"
      className="mx-auto flex w-full max-w-page scroll-mt-32 flex-col gap-6 px-6 py-12"
    >
      {/*
       * Actions sit at the top, not below the panes. At the bottom they were
       * past the whole editor, so loading or clearing a file meant scrolling
       * away from the content being worked on.
       */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <SectionLabel>Viewer</SectionLabel>
            <p className="text-label text-mercury">
              {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-pills bg-carbon-warm px-5.5 py-4.5 text-body-sm text-paper-white">
              Choose file
              <input
                type="file"
                accept=".md,.markdown,.mdx,text/markdown,text/plain"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void readFile(file);
                  // Reset so re-picking the same file fires change again.
                  event.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setSource("");
                setError(null);
              }}
              className="rounded-pills border border-carbon-warm px-5.5 py-4.5 text-body-sm text-carbon-warm"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Kept next to the buttons that trigger it, not at the bottom. */}
        {error && <p className="text-body-sm text-mercury">{error}</p>}
      </div>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => {
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) setIsDragging(false);
        }}
        onDrop={onDrop}
        className="relative grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-body border border-carbon-warm bg-vellum/90">
            <p className="text-body-sm text-carbon-warm">Drop a .md file</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="markdown-source"
            className="text-label uppercase tracking-[0.12em] text-mercury"
          >
            Source
          </label>
          <textarea
            id="markdown-source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            placeholder="Paste Markdown here, or drop a .md file."
            className="min-h-[28rem] w-full resize-y rounded-body border border-carbon-warm bg-paper-white p-5 font-mono text-body-sm text-carbon-warm outline-none lg:h-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-label uppercase tracking-[0.12em] text-mercury">
            Preview
          </p>
          <div className="min-h-[28rem] w-full rounded-body border border-carbon-warm bg-paper-white p-5 lg:h-full">
            <MarkdownPreview source={deferredSource} />
          </div>
        </div>
      </div>
    </section>
  );
}
