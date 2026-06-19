import React, { useState } from "react";
import { PALETTE, FONT_SERIF, FONT_SANS } from "../lib/constants";

// Socratic Margin (desktop): a reflective question floats beside the
// highlighted paragraph. The reader can type an insight and "Add to
// Ledger" to capture it into the Wisdom Ledger / Reflection Archive.
export default function MarginNote({ text, top, onSaveInsight }) {
  const [val, setVal] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!val.trim()) return;
    onSaveInsight(val.trim());
    setSaved(true);
  };

  return (
    <div style={{ position: "absolute", top, left: 0, width: "100%" }}>
      <div className="cr-margin-in" style={{ borderLeft: `2px solid ${PALETTE.moss}`, paddingLeft: 16 }}>
        <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.6, color: PALETTE.mossDeep, margin: "0 0 10px" }}>
          {text}
        </p>
        {!saved ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <textarea
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
              placeholder="Your insight…"
              rows={2}
              aria-label="Your reflection on this paragraph"
              style={{ resize: "none", background: PALETTE.paperSoft, border: `1px solid ${PALETTE.paperDeep}`, borderRadius: 8, padding: "8px 10px", fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.5, color: PALETTE.ink, outline: "none", width: "100%", boxSizing: "border-box" }}
            />
            <button
              onClick={handleSave}
              disabled={!val.trim()}
              className="cr-no-select"
              style={{ alignSelf: "flex-end", padding: "6px 14px", borderRadius: 999, border: "none", background: val.trim() ? PALETTE.moss : PALETTE.paperDeep, color: val.trim() ? PALETTE.paper : PALETTE.inkFaint, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 12, cursor: val.trim() ? "pointer" : "not-allowed" }}
            >
              Add to ledger
            </button>
          </div>
        ) : (
          <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 13, color: PALETTE.moss }}>Saved.</p>
        )}
      </div>
    </div>
  );
}
