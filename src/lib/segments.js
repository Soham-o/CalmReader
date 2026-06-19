import { TERM_DICTIONARY } from "./dictionary";
import { MAX_XRAY_TERMS } from "./constants";

// Scans paragraphs for known terms (X-Ray Clarification) and splits each
// paragraph into renderable segments: plain text runs and term runs.
// Each term is only annotated once per document, capped at MAX_XRAY_TERMS,
// so the page stays calm instead of being wall-to-wall underlines.
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
      if (start > lastIndex) segments.push({ type: "text", content: text.slice(lastIndex, start) });
      segments.push({ type: "term", key, label: match[0], definition: TERM_DICTIONARY[key] });
      used.add(key);
      lastIndex = end;
    }
    if (lastIndex < text.length) segments.push({ type: "text", content: text.slice(lastIndex) });
    if (segments.length === 0) segments.push({ type: "text", content: text });
    return { id: idx, segments, plainText: text };
  });
}
