import React, { useEffect, useState } from "react";
import { PALETTE, FONT_SERIF, FONT_SANS } from "../lib/constants";

// Socratic Margin (mobile): the same reflective prompt + insight capture
// flow as MarginNote, presented as a touch-friendly bottom sheet instead
// of a side margin, since there's no room beside the article on phones.
export default function BottomSheet({ open, text, onClose, onSaveInsight }) {
  const [val, setVal] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) { setVal(""); setSaved(false); }
  }, [open]);

  const handleSave = () => {
    if (!val.trim()) return;
    onSaveInsight(val.trim());
    setSaved(true);
  };

  return (
    <>
      <div onClick={onClose} aria-hidden={!open} style={{ position: "fixed", inset: 0, background: "rgba(44,48,58,0.28)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 320ms ease", zIndex: 60 }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 61,
          background: PALETTE.paperSoft, borderTopLeftRadius: 22, borderTopRightRadius: 22,
          boxShadow: "0 -12px 32px rgba(44,48,58,0.18)",
          padding: "12px 24px calc(30px + env(safe-area-inset-bottom, 0px))",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 420ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <button onClick={onClose} aria-label="Close prompt" className="cr-iconbtn" style={{ width: 36, height: 4, borderRadius: 2, background: PALETTE.paperDeep, margin: "4px auto 20px", display: "block", border: "none", padding: 0 }} />
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
          <span style={{ fontSize: 17, lineHeight: 1, color: PALETTE.moss, marginTop: 3 }}>✦</span>
          <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.6, color: PALETTE.mossDeep, margin: 0 }}>{text}</p>
        </div>
        {!saved ? (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <textarea
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
              placeholder="Your insight in one sentence…"
              rows={2}
              aria-label="Your reflection on this paragraph"
              style={{ flex: 1, resize: "none", background: PALETTE.paper, border: `1px solid ${PALETTE.paperDeep}`, borderRadius: 10, padding: "10px 14px", fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: PALETTE.ink, outline: "none", boxSizing: "border-box" }}
            />
            <button
              onClick={handleSave}
              disabled={!val.trim()}
              className="cr-no-select"
              style={{ padding: "10px 16px", borderRadius: 999, border: "none", background: val.trim() ? PALETTE.moss : PALETTE.paperDeep, color: val.trim() ? PALETTE.paper : PALETTE.inkFaint, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, cursor: val.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap", marginTop: 2 }}
            >
              Save
            </button>
          </div>
        ) : (
          <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 14, color: PALETTE.moss, margin: 0 }}>Saved to your ledger.</p>
        )}
      </div>
    </>
  );
}
