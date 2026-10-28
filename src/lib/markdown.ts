import { Marked, type Tokens } from "marked";
import { UPLOAD_URL_PATTERN } from "@/lib/content/image-ref";

const SAFE_PROTOCOL = /^(?:https?:|mailto:|tel:)/i;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  if (href.startsWith("#")) return true;
  return SAFE_PROTOCOL.test(href);
}

/**
 * Admin content is Markdown. Raw HTML is never rendered, links are limited to
 * safe protocols, images to our own uploads, and headings to H2–H4 because the
 * page title is the only H1.
 */
const markdown = new Marked({
  gfm: true,
  renderer: {
    html() {
      return "";
    },
    heading({ tokens, depth }: Tokens.Heading) {
      const level = Math.min(Math.max(depth, 2), 4);
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
    },
    link({ href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens);
      if (!isSafeHref(href)) return text;
      const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
      const externalAttributes = /^https?:/i.test(href)
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      return `<a href="${escapeHtml(href)}"${titleAttribute}${externalAttributes}>${text}</a>`;
    },
    image({ href, text }: Tokens.Image) {
      if (!UPLOAD_URL_PATTERN.test(href)) return "";
      return `<img src="${href}" alt="${escapeHtml(text)}" loading="lazy" decoding="async">`;
    },
  },
});

export function renderMarkdown(source: string): string {
  return markdown.parse(source, { async: false });
}

/** Plain text for meta descriptions, cut at a word boundary. */
export function markdownToPlainText(source: string, maxLength = 160): string {
  const text = renderMarkdown(source)
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
