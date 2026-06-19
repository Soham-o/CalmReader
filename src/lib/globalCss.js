import { PALETTE } from "./constants";

// Single shared stylesheet (fonts, animations, focus states, reduced-motion).
// Injected once via <style> in CalmReader so every component can rely on
// these utility classes without each one re-declaring keyframes.
export function getGlobalCss() {
  return `
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
      outline: 2px solid ${PALETTE.moss}; outline-offset: 2px; border-radius: 4px;
    }
    textarea::placeholder, input::placeholder { color: ${PALETTE.inkFaint}; opacity: 0.8; }
    @media (prefers-reduced-motion: reduce) {
      .cr-fade-up, .cr-margin-in { animation: none !important; opacity: 1 !important; }
      * { transition-duration: 0.01ms !important; }
    }
  `;
}
