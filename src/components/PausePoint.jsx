import React, { useState } from "react";
import { PALETTE, FONT_SERIF, FONT_SANS } from "../data/constants.js";

export default function PausePoint({ onRecall }) {
  const [val, setVal] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!val.trim()) return;
    onRecall(val.trim());
    setSaved(true);
  };

  return (
    <div className="cr-fade-up" style={{ margin: "72px 0", userSelect: "none" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 15,
            color: PALETTE.inkFaint,
            letterSpacing: 0.3,
            marginBottom: 8,
          }}
        >
          Pause.
        </p>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 15,
            color: PALETTE.inkFaint,
            lineHeight: 1.7,
            maxWidth: 280,
            margin: "0 auto",
          }}
        >
          Without looking back — what do you remember?
        </p>
      </div>

      {!saved ? (
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="One thing…"
            rows={2}
            aria-label="Write what you remember"
            style={{
              flex: 1,
              resize: "none",
              background: PALETTE.paperSoft,
              border: `1px solid ${PALETTE.paperDeep}`,
              borderRadius: 10,
              padding: "10px 14px",
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: 15,
              lineHeight: 1.6,
              color: PALETTE.ink,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleSave}
            disabled={!val.trim()}
            className="cr-no-select"
            aria-label="Save recall"
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "none",
              background: val.trim() ? PALETTE.moss : PALETTE.paperDeep,
              color: val.trim() ? PALETTE.paper : PALETTE.inkFaint,
              fontFamily: FONT_SANS,
              fontWeight: 600,
              fontSize: 13,
              cursor: val.trim() ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
              marginTop: 2,
            }}
          >
            Save
          </button>
        </div>
      ) : (
        <p
          style={{
            textAlign: "center",
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: PALETTE.moss,
          }}
        >
          Noted. Keep reading.
        </p>
      )}
    </div>
  );
}
