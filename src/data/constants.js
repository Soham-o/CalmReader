export const PALETTE = {
  paper: "#F9F6F0",
  paperSoft: "#F1ECE0",
  paperDeep: "#E4DCC8",
  ink: "#2C303A",
  inkFaint: "#8B8779",
  moss: "#6B7A5E",
  mossDeep: "#4D5A44",
  clay: "#B5774A",
};

export const FONT_SERIF = "'Literata', 'Iowan Old Style', Georgia, serif";
export const FONT_SANS = "'Atkinson Hyperlegible', -apple-system, 'Segoe UI', sans-serif";

export const FONT_SIZES = [17, 19.5, 22];
export const MAX_XRAY_TERMS = 12;
export const MAX_PARAGRAPHS = 180;
export const PAUSE_INTERVAL = 6;
export const ARCHIVE_KEY = "calm-reader-archive-v1";

export const GLOBAL_CSS = (moss, inkFaint) => `
  @import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&family=Atkinson+Hyperlegible:wght@400;700&display=swap');
  * { -webkit-tap-highlight-color: transparent; }
  .cr-fade-up { opacity: 0; animation: cr-fade-up-kf 700ms cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes cr-fade-up-kf { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .cr-margin-in { animation: cr-margin-in-kf 480ms cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes cr-margin-in-kf { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); } }
  .cr-ribbon { transition: filter 200ms ease, transform 250ms ease; touch-action: manipulation; }
  .cr-ribbon:hover { filter: brightness(1.08); }
  .cr-ribbon:active { transform: translateX(-50%) scale(0.97); }
  .cr-iconbtn { touch-action: manipulation; }
  .cr-iconbtn:hover { opacity: 0.85; }
  .cr-term { touch-action: manipulation; }
  .cr-term:hover { opacity: 0.7; }
  .cr-no-select { -webkit-user-select: none; user-select: none; touch-action: manipulation; }
  button:focus-visible, span[role="button"]:focus-visible, input:focus-visible, textarea:focus-visible {
    outline: 2px solid ${moss}; outline-offset: 2px; border-radius: 4px;
  }
  textarea::placeholder, input::placeholder { color: ${inkFaint}; opacity: 0.8; }
  @media (prefers-reduced-motion: reduce) {
    .cr-fade-up, .cr-margin-in { animation: none !important; opacity: 1 !important; }
    * { transition-duration: 0.01ms !important; }
  }
`;
