import React from "react";
import { ToggleSwitch, ChevronIcon } from "./Controls";
import { PALETTE, FONT_SERIF, FONT_SANS, FONT_SIZES } from "../lib/constants";

// Pull-down drawer housing Typography Controls and the two main mode
// toggles (Socratic Margin, Deep Focus). Opened via the ribbon tab.
export default function ControlsDrawer({
  drawerOpen,
  setDrawerOpen,
  fontSizeIdx,
  setFontSizeIdx,
  socraticMode,
  setSocraticMode,
  setHighlighted,
  deepFocus,
  setDeepFocus,
}) {
  return (
    <>
      <button
        className="cr-ribbon cr-no-select"
        aria-label={drawerOpen ? "Close reading controls" : "Open reading controls"}
        onClick={() => setDrawerOpen((o) => !o)}
        style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 50, width: 60, height: 28, background: PALETTE.moss, border: "none", clipPath: "polygon(0 0, 100% 0, 100% 76%, 50% 100%, 0 76%)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <ChevronIcon open={drawerOpen} />
      </button>

      <div
        aria-hidden={!drawerOpen}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
          background: PALETTE.paperSoft, borderBottom: `1px solid ${PALETTE.paperDeep}`,
          boxShadow: drawerOpen ? "0 10px 28px rgba(44,48,58,0.10)" : "none",
          transform: drawerOpen ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 460ms cubic-bezier(0.22,1,0.36,1), box-shadow 460ms ease",
        }}
      >
        <div className="flex items-center justify-center flex-wrap" style={{ maxWidth: 780, margin: "0 auto", padding: "22px 28px 10px", gap: 22 }}>
          <div className="flex items-center" style={{ gap: 12 }}>
            <button
              className="cr-iconbtn cr-no-select"
              disabled={fontSizeIdx === 0}
              aria-label="Decrease font size"
              onClick={() => setFontSizeIdx((i) => Math.max(0, i - 1))}
              style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${PALETTE.paperDeep}`, background: PALETTE.paper, color: PALETTE.ink, fontFamily: FONT_SANS, fontSize: 13, cursor: fontSizeIdx === 0 ? "not-allowed" : "pointer", opacity: fontSizeIdx === 0 ? 0.35 : 1 }}
            >
              A−
            </button>
            <span style={{ fontFamily: FONT_SERIF, color: PALETTE.ink, fontSize: 20, minWidth: 22, textAlign: "center" }}>Aa</span>
            <button
              className="cr-iconbtn cr-no-select"
              disabled={fontSizeIdx === FONT_SIZES.length - 1}
              aria-label="Increase font size"
              onClick={() => setFontSizeIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
              style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${PALETTE.paperDeep}`, background: PALETTE.paper, color: PALETTE.ink, fontFamily: FONT_SANS, fontSize: 13, cursor: fontSizeIdx === FONT_SIZES.length - 1 ? "not-allowed" : "pointer", opacity: fontSizeIdx === FONT_SIZES.length - 1 ? 0.35 : 1 }}
            >
              A+
            </button>
          </div>
          <div style={{ width: 1, height: 24, background: PALETTE.paperDeep }} />
          <ToggleSwitch
            label="Socratic Margin"
            checked={socraticMode}
            onChange={() => { setSocraticMode((v) => !v); setHighlighted(null); }}
          />
          <div style={{ width: 1, height: 24, background: PALETTE.paperDeep }} />
          <ToggleSwitch label="Deep Focus" checked={deepFocus} onChange={() => setDeepFocus((v) => !v)} />
        </div>
        <p style={{ textAlign: "center", fontFamily: FONT_SANS, fontStyle: "italic", fontSize: 11.5, color: PALETTE.inkFaint, margin: "0 0 16px" }}>
          {deepFocus ? "Dimming nearby paragraphs to keep you in flow." : "Deep Focus dims surrounding paragraphs as you read."}
        </p>
      </div>
    </>
  );
}
