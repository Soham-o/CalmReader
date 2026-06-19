import { useMemo } from "react";
import { parseImportedText } from "../lib/parsing";
import { buildSegments } from "../lib/segments";

// Derives the full reading document (title, X-Ray-annotated paragraphs,
// truncation flag, estimated reading time) from the raw imported text.
// Memoized so re-renders triggered by UI state (font size, toggles, etc.)
// never re-parse or re-scan the article.
export function useDocument(importedRaw, importHint) {
  return useMemo(() => {
    if (!importedRaw) return null;
    const { title, paragraphs, truncated } = parseImportedText(importedRaw, importHint);
    const withSegments = buildSegments(paragraphs);
    const wordCount = paragraphs.reduce((acc, p) => acc + p.split(/\s+/).filter(Boolean).length, 0);
    const readMins = Math.max(1, Math.round(wordCount / 200));
    return { title, paragraphs: withSegments, truncated, readMins };
  }, [importedRaw, importHint]);
}
