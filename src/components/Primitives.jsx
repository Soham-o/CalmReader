import React from "react";
import { PALETTE, FONT_SANS } from "../data/constants.js";

export function ToggleSwitch({ label, checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className="cr-iconbtn cr-no-select"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 4,
        borderRadius: 8,
      }}
      aria-pressed={checked}
      role="switch"
    >
      <span
        style={{
          fontFamily: FONT_SANS,
          fontSize: 13,
          color: PALETTE.ink,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </span>
      <span
        style={{
          width: 38,
          height: 22,
          borderRadius: 11,
          background: checked ? PALETTE.moss : PALETTE.paperDeep,
          position: "relative",
          transition: "background 300ms ease",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 18 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: PALETTE.paper,
            transition: "left 300ms cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
          }}
        />
      </span>
    </button>
  );
}

export function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 300ms ease",
      }}
    >
      <path
        d="M2 4.5L7 9.5L12 4.5"
        stroke={PALETTE.paper}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
