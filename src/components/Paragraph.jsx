import React from "react";
import TermSpan from "./TermSpan.jsx";
import { PALETTE, FONT_SERIF } from "../data/constants.js";

export default function Paragraph({
  id,
  segments,
  fontSize,
  opacity,
  deepFocus,
  socraticMode,
  highlighted,
  onToggleHighlight,
  paragraphRef,
  expandedTerm,
  setExpandedTerm,
  delay,
}) {
  const effectiveOpacity = deepFocus ? opacity : 1;

  return (
    <p
      ref={paragraphRef}
      data-pid={id}
      className="cr-fade-up"
      style={{ animationDelay: `${delay}ms`, touchAction: "manipulation" }}
      onClick={() => {
        if (socraticMode) onToggleHighlight(id);
      }}
    >
      <span
        style={{
          display: "block",
          fontFamily: FONT_SERIF,
          fontSize,
          lineHeight: 1.85,
          color: PALETTE.ink,
          opacity: effectiveOpacity,
          background: highlighted ? "rgba(107,122,94,0.09)" : "transparent",
          borderLeft: `3px solid ${highlighted ? PALETTE.moss : "transparent"}`,
          borderRadius: 4,
          padding: "2px 16px",
          marginLeft: -16,
          cursor: socraticMode ? "pointer" : "default",
          transition:
            "opacity 700ms ease, background-color 450ms ease, border-color 450ms ease",
        }}
      >
        {segments.map((seg, i) =>
          seg.type === "term" ? (
            <TermSpan
              key={i}
              id={seg.key}
              label={seg.label}
              definition={seg.definition}
              expandedTerm={expandedTerm}
              setExpandedTerm={setExpandedTerm}
            />
          ) : (
            <React.Fragment key={i}>{seg.content}</React.Fragment>
          )
        )}
      </span>
    </p>
  );
}
