import { ARCHIVE_KEY } from "./constants";

// Reflection Archive: persistent, cross-session insight storage (localStorage).
// Distinct from the in-session Wisdom Ledger — this survives page refresh.
export function loadArchive() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveToArchive(entry) {
  try {
    const existing = loadArchive();
    existing.unshift(entry);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch (e) {
    // Storage unavailable (private mode, quota, etc.) — fail silently,
    // the in-session Wisdom Ledger still works.
  }
}
