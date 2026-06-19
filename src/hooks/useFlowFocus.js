import { useEffect, useState } from "react";

// Flow Focus / Deep Focus: observes which paragraph(s) sit in the central
// reading band of the viewport. The reading canvas uses the lowest visible
// paragraph id as "current" to drive opacity dimming and the progress marker.
export function useFlowFocus(paragraphRefs, docKey) {
  const [visibleIds, setVisibleIds] = useState(new Set());

  useEffect(() => {
    setVisibleIds(new Set());
    if (!docKey) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docKey]);

  return visibleIds;
}
