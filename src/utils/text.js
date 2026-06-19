import { ARCHIVE_KEY, MAX_PARAGRAPHS, MAX_XRAY_TERMS } from "../data/constants.js";
import { TERM_DICTIONARY } from "../data/dictionary.js";

/* ── Archive ── */
export function loadArchive() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToArchive(entry) {
  try {
    const existing = loadArchive();
    existing.unshift(entry);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch {}
}

/* ── Text helpers ── */
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
  } catch {
    return null;
  }
}

export function formatDate() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── Document parsing ── */
export function parseImportedText(rawInput, fallbackTitle) {
  let text = rawInput.replace(/\r\n/g, "\n").trim();
  let title = fallbackTitle || "Imported Reading";

  const titleMatch = text.match(/^Title:\s*(.+)$/m);
  if (titleMatch && titleMatch[1].trim()) title = titleMatch[1].trim();

  const marker = text.indexOf("Markdown Content:");
  if (marker !== -1) text = text.slice(marker + "Markdown Content:".length).trim();

  let paras = text
    .split(/\n\s*\n+/)
    .map((s) => s.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);

  if (paras.length <= 1) {
    paras = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }

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

  if (
    !titleMatch &&
    paras.length > 1 &&
    paras[0].length < 90 &&
    !/[.!?]$/.test(paras[0])
  ) {
    title = paras[0];
    paras = paras.slice(1);
  }

  const truncated = paras.length > MAX_PARAGRAPHS;
  if (truncated) paras = paras.slice(0, MAX_PARAGRAPHS);

  return { title, paragraphs: paras, truncated };
}

/* ── X-Ray segment builder ── */
export function buildSegments(paragraphs) {
  const used = new Set();
  const keys = Object.keys(TERM_DICTIONARY).sort((a, b) => b.length - a.length);
  const escaped = keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");

  return paragraphs.map((text, idx) => {
    const segments = [];
    let lastIndex = 0;
    let match;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      const key = match[0].toLowerCase();
      if (!TERM_DICTIONARY[key] || used.has(key) || used.size >= MAX_XRAY_TERMS) continue;

      const start = match.index;
      const end = start + match[0].length;

      if (start > lastIndex) {
        segments.push({ type: "text", content: text.slice(lastIndex, start) });
      }
      segments.push({
        type: "term",
        key,
        label: match[0],
        definition: TERM_DICTIONARY[key],
      });
      used.add(key);
      lastIndex = end;
    }

    if (lastIndex < text.length) {
      segments.push({ type: "text", content: text.slice(lastIndex) });
    }
    if (segments.length === 0) {
      segments.push({ type: "text", content: text });
    }

    return { id: idx, segments, plainText: text };
  });
}

/* ── Reading analytics ── */
export function calcReadMins(paragraphs) {
  const wordCount = paragraphs.reduce(
    (acc, p) => acc + p.split(/\s+/).filter(Boolean).length,
    0
  );
  return Math.max(1, Math.round(wordCount / 200));
}
