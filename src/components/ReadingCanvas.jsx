import React, { useEffect, useState } from "react";
import Paragraph from "./Paragraph";
import PausePoint from "./PausePoint";
import ProgressMarker from "./ProgressMarker";
import MarginNote from "./MarginNote";
import BottomSheet from "./BottomSheet";
import { PALETTE, FONT_SERIF, FONT_SANS, FONT_SIZES, PAUSE_INTERVAL } from "../lib/constants";
import { getPromptForParagraph } from "../lib/socratic";

// Reading Analytics + Active Recall + Flow Focus + Socratic Margin, all
// composed around the article body. This is the largest piece of the
// reading view, but it's pure composition — each behavior lives in its
// own component or hook; this just wires them to the document + state.
export default function ReadingCanvas({
  doc,
  containerRef,
  paragraphRefs,
  fontSizeIdx,
  deepFocus,
  socraticMode,
  highlighted,
  setHighlighted,
  expandedTerm,
  setExpandedTerm,
  currentIndex,
  fraction,
  phase,
  socraticOffset,
  isMobile,
  insights,
  saveInsight,
  saveRecall,
}) {
  const [marginTop, setMarginTop] = useState(0);

  useEffect(() => {
    if (highlighted !== null && paragraphRefs.current[highlighted] && containerRef.current) {
      const pRect = paragraphRefs.current[highlighted].getBoundingClientRect();
      const cRect = containerRef.current.getBoundingClientRect();
      setMarginTop(pRect.top - cRect.top);
    }
  }, [highlighted, fontSizeIdx, isMobile, containerRef, paragraphRefs]);

  const toggleHighlight = (id) => setHighlighted((prev) => (prev === id ? null : id));

  const getPromptData = (para) => getPromptForParagraph(para.plainText, para.id, socraticOffset);

  const rows = [];
  doc.paragraphs.forEach((p, i) => {
    const diff = Math.abs(p.id - currentIndex);
    const opacity = diff === 0 ? 1 : diff === 1 ? 0.72 : 0.35;
    rows.push(
      <Paragraph
        key={`p-${p.id}`}
        id={p.id}
        segments={p.segments}
        fontSize={FONT_SIZES[fontSizeIdx]}
        opacity={opacity}
        deepFocus={deepFocus}
        socraticMode={socraticMode}
        highlighted={socraticMode && highlighted === p.id}
        onToggleHighlight={toggleHighlight}
        paragraphRef={(el) => { paragraphRefs.current[p.id] = el; }}
        expandedTerm={expandedTerm}
        setExpandedTerm={setExpandedTerm}
        delay={120 + i * 50}
      />
    );
    if ((i + 1) % PAUSE_INTERVAL === 0 && i !== doc.paragraphs.length - 1) {
      rows.push(<PausePoint key={`pause-${i}`} pauseIdx={i} onRecall={saveRecall} />);
    }
  });

  const promptText = highlighted !== null ? getPromptData(doc.paragraphs.find((p) => p.id === highlighted)).q : "";

  return (
    <>
      <div ref={containerRef} className="flex justify-center" style={{ position: "relative", maxWidth: 920, margin: "0 auto", paddingLeft: 24, paddingRight: 24, gap: 40 }}>
        <div style={{ width: "100%", maxWidth: 620, paddingTop: 110, paddingBottom: 140 }}>
          <h1 className="cr-fade-up" style={{ fontFamily: FONT_SERIF, fontWeight: 600, fontSize: "clamp(28px, 5vw, 38px)", color: PALETTE.ink, letterSpacing: "-0.01em", marginBottom: 8, lineHeight: 1.22 }}>
            {doc.title}
          </h1>
          {doc.truncated && (
            <p style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: PALETTE.inkFaint, marginBottom: 18 }}>
              Showing the first part of this text for a calmer read.
            </p>
          )}
          <div className="cr-fade-up" style={{ marginTop: 18, animationDelay: "80ms" }}>
            <ProgressMarker phase={phase} fraction={fraction} />
          </div>

          {rows}

          <div style={{ textAlign: "center", marginTop: 48, color: PALETTE.inkFaint, fontSize: 20 }}>❧</div>
          {insights.length > 0 && (
            <p style={{ textAlign: "center", marginTop: 18, fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 14.5, color: PALETTE.inkFaint }}>
              Today you left with {insights.length} insight{insights.length === 1 ? "" : "s"}.
            </p>
          )}
        </div>

        {!isMobile && (
          <div style={{ width: 240, flexShrink: 0, position: "relative" }}>
            {socraticMode && highlighted !== null && (
              <MarginNote key={highlighted} top={marginTop} text={promptText} onSaveInsight={saveInsight} />
            )}
          </div>
        )}
      </div>

      {isMobile && (
        <BottomSheet
          open={socraticMode && highlighted !== null}
          text={promptText}
          onClose={() => setHighlighted(null)}
          onSaveInsight={saveInsight}
        />
      )}
    </>
  );
}
