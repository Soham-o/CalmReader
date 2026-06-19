import { MAX_PARAGRAPHS } from "./constants";

export function prettifyFilename(name) {
  const base = name.replace(/\.[^/.]+$/, "");
  return (
    base
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Imported File"
  );
}

export function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (e) {
    return null;
  }
}

// Parses raw pasted/uploaded/fetched text into a title + clean paragraph list.
// Handles Jina AI's "Title:" / "Markdown Content:" preamble, strips markdown
// syntax (headers, links, images, bullets), and caps length for a calm read.
export function parseImportedText(rawInput, fallbackTitle) {
  let text = rawInput.replace(/\r\n/g, "\n").trim();
  let title = fallbackTitle || "Imported Reading";

  const titleMatch = text.match(/^Title:\s*(.+)$/m);
  if (titleMatch && titleMatch[1].trim()) title = titleMatch[1].trim();
  const marker = text.indexOf("Markdown Content:");
  if (marker !== -1) text = text.slice(marker + "Markdown Content:".length).trim();

  let paras = text.split(/\n\s*\n+/).map((s) => s.replace(/[ \t]+/g, " ").trim()).filter(Boolean);
  if (paras.length <= 1) paras = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);

  paras = paras
    .map((p) =>
      p
        .replace(/^#+\s*/, "")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/^[-*]\s+/, "")
        .trim()
    )
    .filter((p) => p.length > 1);

  if (!titleMatch && paras.length > 1 && paras[0].length < 90 && !/[.!?]$/.test(paras[0])) {
    title = paras[0];
    paras = paras.slice(1);
  }

  const truncated = paras.length > MAX_PARAGRAPHS;
  if (truncated) paras = paras.slice(0, MAX_PARAGRAPHS);

  return { title, paragraphs: paras, truncated };
}
