"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SAMPLE_MARKDOWN } from "@/lib/sample-markdown";
import { SectionLabel } from "@/components/section-label";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function MarkdownViewer() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragDepth = useRef(0);

  const readFile = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setError("That file is larger than 5 MB.");
      return;
    }
    try {
      setSource(await file.text());
      setError(null);
    } catch {
      setError("That file could not be read.");
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

  const isEmpty = source.trim().length === 0;
  const wordCount = useMemo(
    () => (isEmpty ? 0 : source.trim().split(/\s+/).length),
    [source, isEmpty],
  );

  return (
    <section
      id="viewer"
      className="mx-auto flex w-full max-w-page flex-col gap-6 px-6 py-12"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionLabel>Viewer</SectionLabel>
        <p className="text-label text-mercury">
          {wordCount.toLocaleString()} words
        </p>
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
            {isEmpty ? (
              <p className="text-body-sm text-mercury">
                Nothing to preview yet.
              </p>
            ) : (
              <article className="markdown-body">
                <Markdown remarkPlugins={[remarkGfm]}>{source}</Markdown>
              </article>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
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
        {error && <p className="text-body-sm text-mercury">{error}</p>}
      </div>
    </section>
  );
}
