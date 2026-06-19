import { useCallback, useState } from "react";
import { saveToArchive } from "../lib/archiveStorage";

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Manages the in-session Wisdom Ledger (insights array shown in the side
// panel/badge) while mirroring every entry into the persistent Reflection
// Archive (localStorage). Two save paths:
//   - saveInsight: a Socratic Margin reflection tied to the article title
//   - saveRecall: an Active Recall Pause Point answer, tagged "— recall"
export function useInsights(currentTitle) {
  const [insights, setInsights] = useState([]);

  const saveInsight = useCallback(
    (text) => {
      const entry = { text, title: currentTitle, date: todayLabel() };
      setInsights((prev) => [...prev, entry]);
      saveToArchive(entry);
    },
    [currentTitle]
  );

  const saveRecall = useCallback(
    (text) => {
      const entry = { text, title: currentTitle ? `${currentTitle} — recall` : "Recall", date: todayLabel() };
      setInsights((prev) => [...prev, entry]);
      saveToArchive(entry);
    },
    [currentTitle]
  );

  const resetInsights = useCallback(() => setInsights([]), []);

  return { insights, saveInsight, saveRecall, resetInsights };
}
