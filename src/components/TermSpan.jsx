import React from "react";
import { PALETTE, FONT_SANS } from "../lib/constants";

// X-Ray Clarification: a dashed-underline term that expands its definition
// inline (CSS grid-rows trick) instead of a modal, so the reading flow is
// never interrupted.
export default function TermSpan({ id, label, definition, expandedTerm, setExpandedTerm }) {
  const isOpen = expandedTerm === id;
  return (
    <span style={{ position: "relative" }}>
      <span
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={(e) => { e.stopPropagation(); setExpandedTerm(isOpen ? null : id); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedTerm(isOpen ? null : id); } }}
        className="cr-term"
        style={{ borderBottom: `1.5px dashed ${PALETTE.clay}`, color: PALETTE.clay, cursor: "pointer", paddingBottom: 1 }}
      >
        {label}
      </span>
      <span style={{ display: "inline-grid", gridTemplateRows: isOpen ? "1fr" : "0fr", width: "100%", transition: "grid-template-rows 420ms cubic-bezier(0.4,0,0.2,1)" }}>
        <span style={{ overflow: "hidden" }}>
          <span style={{ display: "block", margin: "10px 0 6px", padding: "12px 16px", background: PALETTE.paperSoft, borderLeft: `3px solid ${PALETTE.clay}`, borderRadius: 6, fontFamily: FONT_SANS, fontStyle: "italic", fontSize: "0.82em", color: PALETTE.ink, opacity: 0.88, lineHeight: 1.55 }}>
            {definition}
          </span>
        </span>
      </span>
    </span>
  );
}
