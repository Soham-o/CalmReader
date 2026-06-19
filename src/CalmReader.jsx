import React, { useEffect, useMemo, useRef, useState } from "react";

import { PALETTE } from "./lib/constants";
import { getGlobalCss } from "./lib/globalCss";
import { SOCRATIC_BANK } from "./lib/socratic";
import { useDocument } from "./hooks/useDocument";
import { useIsMobile } from "./hooks/useIsMobile";
import { useFlowFocus } from "./hooks/useFlowFocus";
import { useInsights } from "./hooks/useInsights";

import ImporterCanvas from "./components/ImporterCanvas";
import ReadingRitual from "./components/ReadingRitual";
import ReadingCanvas from "./components/ReadingCanvas";
import ControlsDrawer from "./components/ControlsDrawer";
import WisdomLedgerPanel from "./components/WisdomLedgerPanel";
import ArchivePanel from "./components/ArchivePanel";
import { BackButton, ArchiveButton, LedgerButton } from "./components/ChromeButtons";

// CalmReader: a cognitive reading environment built around
// Read → Reflect → Recall → Capture Insight → Build Personal Knowledge.
//
// This top-level component owns session state (which article, which UI
// mode is on) and composes the importer / ritual / reading canvas /
// drawer / panels. All article parsing, X-Ray scanning, Flow Focus
// tracking, and persistence live in lib/ and hooks/ so this file stays
// readable as the single source of truth for "what screen is showing."
function CalmReader() {
  const [importedRaw, setImportedRaw] = useState(null);
  const [importHint, setImportHint] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [socraticMode, setSocraticMode] = useState(false);
  const [deepFocus, setDeepFocus] = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const [expandedTerm, setExpandedTerm] = useState(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");

  const containerRef = useRef(null);
  const paragraphRefs = useRef({});

  const isMobile = useIsMobile();
  const doc = useDocument(importedRaw, importHint);
  const visibleIds = useFlowFocus(paragraphRefs, doc);
  const { insights, saveInsight, saveRecall, resetInsights } = useInsights(currentTitle);

  // A stable per-document offset so the rotating Socratic question bank
  // doesn't always start on the same question for the same paragraph index.
  const socraticOffset = useMemo(() => Math.floor(Math.random() * SOCRATIC_BANK.length), [importedRaw]);

  useEffect(() => {
    document.body.style.overflow = isMobile && socraticMode && highlighted !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, socraticMode, highlighted]);

  useEffect(() => {
    if (doc) setCurrentTitle(doc.title);
  }, [doc]);

  const currentIndex = visibleIds.size ? Math.min(...visibleIds) : 0;
  const totalParagraphs = doc ? doc.paragraphs.length : 1;
  const fraction = totalParagraphs > 1 ? currentIndex / (totalParagraphs - 1) : 0;
  const phase = fraction < 0.33 ? "Beginning" : fraction < 0.7 ? "Middle" : "Reflection";

  const handleLoad = (raw, hint) => {
    if (!raw || !raw.trim()) return;
    paragraphRefs.current = {};
    resetInsights();
    setLedgerOpen(false);
    setImportHint(hint);
    setImportedRaw(raw);
    setHighlighted(null);
    setExpandedTerm(null);
    setDrawerOpen(false);
    setRitual(true);
    setTimeout(() => setRitual(false), 3000);
  };

  const backToImporter = () => {
    paragraphRefs.current = {};
    resetInsights();
    setLedgerOpen(false);
    setImportedRaw(null);
    setHighlighted(null);
    setExpandedTerm(null);
    setDrawerOpen(false);
    setSocraticMode(false);
    setDeepFocus(false);
    setRitual(false);
  };

  const globalCss = getGlobalCss();

  if (!doc) {
    return (
      <div style={{ minHeight: "100vh", background: PALETTE.paper, backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%)" }}>
        <style>{globalCss}</style>
        <ArchiveButton variant="importer" onClick={() => setArchiveOpen(true)} />
        <ImporterCanvas onLoad={handleLoad} />
        <ArchivePanel open={archiveOpen} onClose={() => setArchiveOpen(false)} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.paper, backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%)", position: "relative" }}>
      <style>{globalCss}</style>

      <ReadingRitual visible={ritual} minutes={doc.readMins} />

      <BackButton onClick={backToImporter} />
      <ArchiveButton variant="reading" onClick={() => setArchiveOpen(true)} />
      <LedgerButton onClick={() => setLedgerOpen(true)} count={insights.length} />

      <ControlsDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        fontSizeIdx={fontSizeIdx}
        setFontSizeIdx={setFontSizeIdx}
        socraticMode={socraticMode}
        setSocraticMode={setSocraticMode}
        setHighlighted={setHighlighted}
        deepFocus={deepFocus}
        setDeepFocus={setDeepFocus}
      />

      <ReadingCanvas
        doc={doc}
        containerRef={containerRef}
        paragraphRefs={paragraphRefs}
        fontSizeIdx={fontSizeIdx}
        deepFocus={deepFocus}
        socraticMode={socraticMode}
        highlighted={highlighted}
        setHighlighted={setHighlighted}
        expandedTerm={expandedTerm}
        setExpandedTerm={setExpandedTerm}
        currentIndex={currentIndex}
        fraction={fraction}
        phase={phase}
        socraticOffset={socraticOffset}
        isMobile={isMobile}
        insights={insights}
        saveInsight={saveInsight}
        saveRecall={saveRecall}
      />

      <WisdomLedgerPanel open={ledgerOpen} insights={insights} onClose={() => setLedgerOpen(false)} />
      <ArchivePanel open={archiveOpen} onClose={() => setArchiveOpen(false)} />
    </div>
  );
}

export default CalmReader;
