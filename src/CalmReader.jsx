import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

import { PALETTE, FONT_SERIF, FONT_SANS, FONT_SIZES, PAUSE_INTERVAL, GLOBAL_CSS } from "./data/constants.js";
import { getPromptForParagraph } from "./data/socratic.js";
import { saveToArchive, formatDate } from "./utils/text.js";
import { useIsMobile, useDeepFocus, useDocument, useBodyScrollLock } from "./hooks/index.js";

import ImporterCanvas from "./components/ImporterCanvas.jsx";
import ReadingRitual from "./components/ReadingRitual.jsx";
import ReadingControls from "./components/ReadingControls.jsx";
import Paragraph from "./components/Paragraph.jsx";
import PausePoint from "./components/PausePoint.jsx";
import ProgressMarker from "./components/ProgressMarker.jsx";
import MarginNote from "./components/MarginNote.jsx";
import BottomSheet from "./components/BottomSheet.jsx";
import WisdomLedgerPanel from "./components/WisdomLedgerPanel.jsx";
import ArchivePanel from "./components/ArchivePanel.jsx";

export default function CalmReader() {
  /* Import state */
  const [importedRaw, setImportedRaw] = useState(null);
  const [importHint, setImportHint] = useState(null);

  /* UI state */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [socraticMode, setSocraticMode] = useState(false);
  const [deepFocus, setDeepFocus] = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const [expandedTerm, setExpandedTerm] = useState(null);
  const [marginTop, setMarginTop] = useState(0);
  const [ritual, setRitual] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");

  /* Panels */
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  /* Insights */
  const [insights, setInsights] = useState([]);
  const [recallCount, setRecallCount] = useState(0);

  /* Refs */
  const containerRef = useRef(null);
  const paragraphRefs = useRef({});

  /* Derived state */
  const isMobile = useIsMobile();
  const doc = useDocument(importedRaw, importHint);
  const visibleIds = useDeepFocus(doc, paragraphRefs);

  useBodyScrollLock(isMobile && socraticMode && highlighted !== null);

  const socraticOffset = useMemo(
    () => Math.floor(Math.random() * 12),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [importedRaw]
  );

  /* Reading position */
  const currentIndex = visibleIds.size ? Math.min(...visibleIds) : 0;
  const totalParagraphs = doc ? doc.paragraphs.length : 1;
  const fraction = totalParagraphs > 1 ? currentIndex / (totalParagraphs - 1) : 0;
  const phase = fraction < 0.33 ? "Beginning" : fraction < 0.7 ? "Middle" : "Reflection";

  useEffect(() => {
    if (doc) setCurrentTitle(doc.title);
  }, [doc]);

  useEffect(() => {
    if (highlighted !== null && paragraphRefs.current[highlighted] && containerRef.current) {
      const pRect = paragraphRefs.current[highlighted].getBoundingClientRect();
      const cRect = containerRef.current.getBoundingClientRect();
      setMarginTop(pRect.top - cRect.top);
    }
  }, [highlighted, fontSizeIdx, isMobile]);

  const saveInsight = useCallback(
    (text) => {
      const entry = { text, title: currentTitle, date: formatDate() };
      setInsights((prev) => [...prev, entry]);
      saveToArchive(entry);
    },
    [currentTitle]
  );

  const saveRecall = useCallback(
    (text) => {
      const label = currentTitle ? `${currentTitle} — recall` : "Recall";
      const entry = { text, title: label, date: formatDate() };
      setInsights((prev) => [...prev, entry]);
      setRecallCount((c) => c + 1);
      saveToArchive(entry);
    },
    [currentTitle]
  );

  const toggleHighlight = (id) => setHighlighted((prev) => (prev === id ? null : id));

  const handleLoad = (raw, hint) => {
    if (!raw || !raw.trim()) return;
    paragraphRefs.current = {};
    setInsights([]);
    setRecallCount(0);
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
    setInsights([]);
    setRecallCount(0);
    setLedgerOpen(false);
    setImportedRaw(null);
    setHighlighted(null);
    setExpandedTerm(null);
    setDrawerOpen(false);
    setSocraticMode(false);
    setDeepFocus(false);
    setRitual(false);
  };

  const globalCss = GLOBAL_CSS(PALETTE.moss, PALETTE.inkFaint);

  /* IMPORTER SCREEN */
  if (!doc) {
    return (
      <div style={{ minHeight: "100vh", background: PALETTE.paper, backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%)" }}>
        <style>{globalCss}</style>
        <button
          onClick={() => setArchiveOpen(true)}
          aria-label="Open reflection archive"
          className="cr-iconbtn cr-no-select"
          style={{ position: "fixed", top: 14, left: 14, zIndex: 45, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(241,236,224,0.85)", color: PALETTE.mossDeep, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, opacity: 0.7 }}
        >
          ✎
        </button>
        <ImporterCanvas onLoad={handleLoad} />
        <ArchivePanel open={archiveOpen} onClose={() => setArchiveOpen(false)} />
      </div>
    );
  }

  /* BUILD READING ROWS */
  const rows = [];
  doc.paragraphs.forEach((p, i) => {
    const diff = Math.abs(p.id - currentIndex);
    const opacity = diff === 0 ? 1 : diff === 1 ? 0.72 : 0.35;
    rows.push(
      <Paragraph
        key={`p-${p.id}`}
        id={p.id}
        segments={p.segments}
        fontSize={FONT_SIZES[fontSizeIdx]}
        opacity={opacity}
        deepFocus={deepFocus}
        socraticMode={socraticMode}
        highlighted={socraticMode && highlighted === p.id}
        onToggleHighlight={toggleHighlight}
        paragraphRef={(el) => { paragraphRefs.current[p.id] = el; }}
        expandedTerm={expandedTerm}
        setExpandedTerm={setExpandedTerm}
        delay={120 + i * 50}
      />
    );
    if ((i + 1) % PAUSE_INTERVAL === 0 && i !== doc.paragraphs.length - 1) {
      rows.push(<PausePoint key={`pause-${i}`} onRecall={saveRecall} />);
    }
  });

  const promptText =
    highlighted !== null
      ? getPromptForParagraph(
          doc.paragraphs.find((p) => p.id === highlighted)?.plainText || "",
          highlighted,
          socraticOffset
        ).q
      : "";

  /* READING SCREEN */
  return (
    <div style={{ minHeight: "100vh", background: PALETTE.paper, backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%)", position: "relative" }}>
      <style>{globalCss}</style>

      <ReadingRitual visible={ritual} minutes={doc.readMins} />

      <button
        onClick={backToImporter}
        aria-label="Import a different text"
        className="cr-iconbtn cr-no-select"
        style={{ position: "fixed", top: 14, left: 14, zIndex: 45, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(241,236,224,0.85)", color: PALETTE.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0.55, fontSize: 16 }}
      >
        ←
      </button>

      <button
        onClick={() => setArchiveOpen(true)}
        aria-label="Open reflection archive"
        className="cr-iconbtn cr-no-select"
        style={{ position: "fixed", bottom: 18, left: 14, zIndex: 45, padding: "7px 14px", borderRadius: 999, border: `1px solid ${PALETTE.paperDeep}`, background: "rgba(241,236,224,0.85)", color: PALETTE.mossDeep, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", opacity: 0.7, fontFamily: FONT_SANS, fontSize: 12 }}
      >
        <span style={{ fontSize: 13 }}>☍</span> Archive
      </button>

      <button
        onClick={() => setLedgerOpen(true)}
        aria-label={`Wisdom Ledger, ${insights.length} insight${insights.length === 1 ? "" : "s"} collected`}
        className="cr-iconbtn cr-no-select"
        style={{ position: "fixed", top: 14, right: 14, zIndex: 45, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(241,236,224,0.85)", color: PALETTE.moss, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: insights.length > 0 ? 0.9 : 0.5, fontSize: 15 }}
      >
        ✎
        {insights.length > 0 && (
          <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: PALETTE.clay, color: PALETTE.paper, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS }}>
            {insights.length}
          </span>
        )}
      </button>

      <ReadingControls
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        fontSizeIdx={fontSizeIdx}
        setFontSizeIdx={setFontSizeIdx}
        socraticMode={socraticMode}
        setSocraticMode={setSocraticMode}
        setHighlighted={setHighlighted}
        deepFocus={deepFocus}
        setDeepFocus={setDeepFocus}
        readMins={doc.readMins}
        insightCount={insights.length}
        recallCount={recallCount}
      />

      <div ref={containerRef} style={{ position: "relative", maxWidth: 920, margin: "0 auto", paddingLeft: 24, paddingRight: 24, display: "flex", gap: 40 }}>
        <div style={{ width: "100%", maxWidth: 620, paddingTop: 110, paddingBottom: 140 }}>
          <h1 className="cr-fade-up" style={{ fontFamily: FONT_SERIF, fontWeight: 600, fontSize: "clamp(28px, 5vw, 38px)", color: PALETTE.ink, letterSpacing: "-0.01em", marginBottom: 8, lineHeight: 1.22 }}>
            {doc.title}
          </h1>

          {doc.truncated && (
            <p style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: PALETTE.inkFaint, marginBottom: 18 }}>
              Showing the first part of this text for a calmer read.
            </p>
          )}

          <div className="cr-fade-up" style={{ marginTop: 18, animationDelay: "80ms" }}>
            <ProgressMarker phase={phase} fraction={fraction} />
          </div>

          {rows}

          <div style={{ textAlign: "center", marginTop: 48, color: PALETTE.inkFaint, fontSize: 20 }} aria-hidden="true">❧</div>

          {insights.length > 0 && (
            <p style={{ textAlign: "center", marginTop: 18, fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 14.5, color: PALETTE.inkFaint }}>
              Today you left with {insights.length} insight{insights.length === 1 ? "" : "s"}.
            </p>
          )}
        </div>

        {!isMobile && (
          <div style={{ width: 240, flexShrink: 0, position: "relative" }}>
            {socraticMode && highlighted !== null && (
              <MarginNote key={highlighted} top={marginTop} text={promptText} onSaveInsight={saveInsight} />
            )}
          </div>
        )}
      </div>

      {isMobile && (
        <BottomSheet
          open={socraticMode && highlighted !== null}
          text={promptText}
          onClose={() => setHighlighted(null)}
          onSaveInsight={saveInsight}
        />
      )}

      <WisdomLedgerPanel open={ledgerOpen} insights={insights} onClose={() => setLedgerOpen(false)} />
      <ArchivePanel open={archiveOpen} onClose={() => setArchiveOpen(false)} />
    </div>
  );
}
