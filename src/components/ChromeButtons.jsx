import React from "react";
import { PALETTE, FONT_SANS } from "../lib/constants";

// Fixed-position chrome shared by the reading view: back-to-importer,
// Reflection Archive access (bottom-left), and the Wisdom Ledger badge
// (top-right) showing this session's insight count.
export function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Import a different text"
      className="cr-iconbtn cr-no-select"
      style={{ position: "fixed", top: 14, left: 14, zIndex: 45, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(241,236,224,0.85)", color: PALETTE.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0.55, fontSize: 16 }}
    >
      ←
    </button>
  );
}

export function ArchiveButton({ onClick, variant = "reading" }) {
  if (variant === "importer") {
    return (
      <button
        onClick={onClick}
        aria-label="Open reflection archive"
        className="cr-iconbtn cr-no-select"
        style={{ position: "fixed", top: 14, left: 14, zIndex: 45, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(241,236,224,0.85)", color: PALETTE.mossDeep, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, opacity: 0.7 }}
      >
        ✎
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      aria-label="Open reflection archive"
      className="cr-iconbtn cr-no-select"
      style={{ position: "fixed", bottom: 18, left: 14, zIndex: 45, padding: "7px 14px", borderRadius: 999, border: `1px solid ${PALETTE.paperDeep}`, background: "rgba(241,236,224,0.85)", color: PALETTE.mossDeep, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", opacity: 0.7, fontFamily: FONT_SANS, fontSize: 12 }}
    >
      <span style={{ fontSize: 13 }}>☍</span> Archive
    </button>
  );
}

export function LedgerButton({ onClick, count }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Wisdom Ledger, ${count} insight${count === 1 ? "" : "s"} collected`}
      className="cr-iconbtn cr-no-select"
      style={{ position: "fixed", top: 14, right: 14, zIndex: 45, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(241,236,224,0.85)", color: PALETTE.moss, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: count > 0 ? 0.9 : 0.5, fontSize: 15 }}
    >
      ✎
      {count > 0 && (
        <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: PALETTE.clay, color: PALETTE.paper, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS }}>
          {count}
        </span>
      )}
    </button>
  );
}
