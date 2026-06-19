import React, { useState, useEffect } from "react";
import { PALETTE, FONT_SERIF, FONT_SANS } from "../data/constants.js";
import { loadArchive } from "../utils/text.js";

export default function ArchivePanel({ open, onClose }) {
  const [search, setSearch] = useState("");
  const [archive, setArchive] = useState([]);

  useEffect(() => {
    if (open) setArchive(loadArchive());
  }, [open]);

  const filtered = search.trim()
    ? archive.filter(
        (e) =>
          e.text.toLowerCase().includes(search.toLowerCase()) ||
          (e.title || "").toLowerCase().includes(search.toLowerCase())
      )
    : archive;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(44,48,58,0.22)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 320ms ease",
          zIndex: 62,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reflection Archive"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 63,
          width: "min(400px, 92vw)",
          background: PALETTE.paperSoft,
          borderRight: `1px solid ${PALETTE.paperDeep}`,
          boxShadow: "12px 0 32px rgba(44,48,58,0.14)",
          padding: "26px 24px",
          overflowY: "auto",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 420ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: FONT_SERIF,
                fontSize: 20,
                color: PALETTE.ink,
                margin: 0,
              }}
            >
              Reflection Archive
            </h2>
            {archive.length > 0 && (
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  color: PALETTE.inkFaint,
                  margin: "4px 0 0",
                }}
              >
                {archive.length} reflection{archive.length === 1 ? "" : "s"} across all sessions
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close archive"
            className="cr-no-select"
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              color: PALETTE.inkFaint,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search all reflections…"
          aria-label="Search archive"
          style={{
            width: "100%",
            background: PALETTE.paper,
            border: `1px solid ${PALETTE.paperDeep}`,
            borderRadius: 10,
            padding: "9px 14px",
            fontFamily: FONT_SANS,
            fontSize: 14,
            color: PALETTE.ink,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 18,
          }}
        />

        {filtered.length === 0 && archive.length === 0 ? (
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13.5,
              color: PALETTE.inkFaint,
              lineHeight: 1.7,
            }}
          >
            Your reflections from every reading session will appear here — searchable,
            forever.
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: PALETTE.inkFaint }}>
            No matches for "{search}".
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filtered.map((entry, i) => (
              <li
                key={i}
                style={{
                  marginBottom: 22,
                  paddingBottom: 22,
                  borderBottom:
                    i < filtered.length - 1
                      ? `1px solid ${PALETTE.paperDeep}`
                      : "none",
                }}
              >
                {entry.title && (
                  <p
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: PALETTE.clay,
                      margin: "0 0 5px",
                    }}
                  >
                    {entry.title}
                  </p>
                )}
                <p
                  style={{
                    fontFamily: FONT_SERIF,
                    fontStyle: "italic",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: PALETTE.ink,
                    margin: "0 0 4px",
                  }}
                >
                  {entry.text}
                </p>
                <p
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 11.5,
                    color: PALETTE.inkFaint,
                    margin: 0,
                  }}
                >
                  {entry.date}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
