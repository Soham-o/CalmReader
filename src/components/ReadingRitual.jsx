import React from "react";
import { PALETTE, FONT_SERIF, FONT_SANS } from "../lib/constants";

// Reading Ritual: a brief full-screen "take a slow breath" transition
// shown right after import, before the article fades in. A deliberate
// psychological context switch — not a loading spinner.
export default function ReadingRitual({ visible, minutes }) {
  return (
    <div
      aria-hidden={!visible}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: PALETTE.paper,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 900ms ease",
      }}
    >
      <div style={{ textAlign: "center", padding: 24 }}>
        <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: "clamp(20px,4vw,26px)", color: PALETTE.ink, marginBottom: 14 }}>
          Take a slow breath.
        </p>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: PALETTE.inkFaint }}>
          This will take about {minutes} minute{minutes === 1 ? "" : "s"} to read.
        </p>
      </div>
    </div>
  );
}
