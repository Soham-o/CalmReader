import { useState, useEffect, useRef, useMemo } from "react";
import { parseImportedText, buildSegments, calcReadMins } from "../utils/text.js";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);

  return isMobile;
}

export function useDeepFocus(doc, paragraphRefs) {
  const [visibleIds, setVisibleIds] = useState(new Set());

  useEffect(() => {
    if (!doc) return;
    const els = Object.values(paragraphRefs.current).filter(Boolean);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const id = Number(entry.target.getAttribute("data-pid"));
            if (entry.isIntersecting) next.add(id);
            else next.delete(id);
          });
          return next;
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [doc]);

  return visibleIds;
}

export function useDocument(importedRaw, importHint) {
  return useMemo(() => {
    if (!importedRaw) return null;
    const { title, paragraphs, truncated } = parseImportedText(importedRaw, importHint);
    const withSegments = buildSegments(paragraphs);
    const readMins = calcReadMins(paragraphs);
    return { title, paragraphs: withSegments, truncated, readMins };
  }, [importedRaw, importHint]);
}

export function useBodyScrollLock(locked) {
  useEffect(() => {
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);
}
