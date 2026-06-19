import React from "react";
import { PALETTE, FONT_SANS } from "../lib/constants";

// Reading Progress Marker. Deliberately literary, not a percentage bar:
// shows "Beginning / Middle / Reflection" with a small dot sliding along
// a thin line, derived from the Flow Focus reading position.
export default function ProgressMarker({ phase, fraction }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 44 }} aria-label={`Reading position: ${phase}`}>
      <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: PALETTE.inkFaint, marginBottom: 8 }}>{phase}</div>
      <div style={{ position: "relative", width: 130, height: 8, margin: "0 auto" }}>
        <div style={{ position: "absolute", top: 3, left: 0, right: 0, height: 1, background: PALETTE.paperDeep }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `calc(${fraction * 100}% - 3.5px)`,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: PALETTE.moss,
            transition: "left 550ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
  );
}
