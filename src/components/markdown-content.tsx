import { renderMarkdown } from "@/lib/markdown";

/** renderMarkdown strips raw HTML and filters links/images, so its output is safe to inject. */
export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}
