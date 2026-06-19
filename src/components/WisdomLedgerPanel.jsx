import React, { useState } from "react";
import { PALETTE, FONT_SERIF, FONT_SANS } from "../lib/constants";

// Wisdom Ledger: session-scoped panel listing every insight/recall the
// reader has captured during this reading session, with search once
// there are enough entries to warrant it.
export default function WisdomLedgerPanel({ open, insights, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? insights.filter((ins) => ins.text.toLowerCase().includes(search.toLowerCase()) || (ins.title || "").toLowerCase().includes(search.toLowerCase()))
    : insights;

  return (
    <>
      <div onClick={onClose} aria-hidden={!open} style={{ position: "fixed", inset: 0, background: "rgba(44,48,58,0.22)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 320ms ease", zIndex: 62 }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Wisdom Ledger"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 63,
          width: "min(400px, 92vw)", background: PALETTE.paperSoft,
          borderLeft: `1px solid ${PALETTE.paperDeep}`, boxShadow: "-12px 0 32px rgba(44,48,58,0.14)",
          padding: "26px 24px", overflowY: "auto",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 420ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontFamily: FONT_SERIF, fontSize: 20, color: PALETTE.ink, margin: 0 }}>Wisdom Ledger</h2>
          <button onClick={onClose} aria-label="Close ledger" className="cr-no-select" style={{ background: "transparent", border: "none", fontSize: 20, color: PALETTE.inkFaint, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {insights.length > 3 && (
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your thoughts…"
            aria-label="Search this session's insights"
            style={{ width: "100%", background: PALETTE.paper, border: `1px solid ${PALETTE.paperDeep}`, borderRadius: 10, padding: "9px 14px", fontFamily: FONT_SANS, fontSize: 14, color: PALETTE.ink, outline: "none", boxSizing: "border-box", marginBottom: 18 }}
          />
        )}

        {filtered.length === 0 && insights.length === 0 ? (
          <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: PALETTE.inkFaint, lineHeight: 1.6 }}>
            Turn on Socratic Margin and tap a paragraph. Write your own insight — it collects here.
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: PALETTE.inkFaint }}>No matches for "{search}".</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filtered.map((ins, i) => (
              <li key={i} className="cr-fade-up" style={{ marginBottom: 22, paddingBottom: 22, borderBottom: i < filtered.length - 1 ? `1px solid ${PALETTE.paperDeep}` : "none" }}>
                {ins.title && (
                  <p style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: PALETTE.clay, margin: "0 0 5px" }}>{ins.title}</p>
                )}
                <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.6, color: PALETTE.ink, margin: "0 0 4px" }}>{ins.text}</p>
                {ins.date && (
                  <p style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: PALETTE.inkFaint, margin: 0 }}>{ins.date}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
