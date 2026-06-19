import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

const PALETTE = {
  paper: "#F9F6F0",
  paperSoft: "#F1ECE0",
  paperDeep: "#E4DCC8",
  ink: "#2C303A",
  inkFaint: "#8B8779",
  moss: "#6B7A5E",
  mossDeep: "#4D5A44",
  clay: "#B5774A",
};

const FONT_SERIF = "'Literata', 'Iowan Old Style', Georgia, serif";
const FONT_SANS = "'Atkinson Hyperlegible', -apple-system, 'Segoe UI', sans-serif";

const FONT_SIZES = [17, 19.5, 22];
const MAX_XRAY_TERMS = 12;
const MAX_PARAGRAPHS = 180;
const PAUSE_INTERVAL = 6;
const ARCHIVE_KEY = "calm-reader-archive-v1";

const TERM_DICTIONARY = {
  "hypothesis": "a testable proposition offered as a provisional explanation, not yet confirmed.",
  "correlation": "a statistical relationship in which two variables move together, without proving either one causes the other.",
  "causation": "a relationship in which one event directly produces or brings about another.",
  "empirical": "based on observation or experiment rather than theory alone.",
  "paradigm": "a shared framework of assumptions that defines what questions a field treats as worth asking.",
  "cognitive": "relating to the mental processes of thinking, knowing, and understanding.",
  "bias": "a systematic tendency to favor certain conclusions, often without conscious awareness.",
  "heuristic": "a mental shortcut that trades some accuracy for speed when making a judgment.",
  "framework": "an underlying structure of ideas that organizes how a topic is approached.",
  "narrative": "the particular way a sequence of events is selected and told, shaping how it's understood.",
  "discourse": "the body of language and assumptions a community uses to talk about a subject.",
  "ideology": "a connected system of beliefs that shapes how someone interprets events.",
  "synthesis": "the act of combining separate ideas into a single, more coherent whole.",
  "dialectic": "a method of reasoning that works through the tension between opposing ideas.",
  "epistemology": "the branch of philosophy concerned with how we know what we claim to know.",
  "ontology": "the branch of philosophy concerned with what kinds of things actually exist.",
  "phenomenon": "an observable event or fact, especially one whose cause is still under investigation.",
  "methodology": "the set of methods and principles used to carry out an investigation.",
  "inference": "a conclusion reached through evidence and reasoning rather than direct observation.",
  "rhetoric": "the art of using language persuasively, sometimes at the expense of strict accuracy.",
  "paradox": "a statement or situation that seems to contradict itself yet may still be true.",
  "dichotomy": "a division between two things treated as sharply opposed and mutually exclusive.",
  "nuance": "a subtle distinction or shade of meaning easily lost in a simplified account.",
  "systemic": "affecting an entire system, rather than one isolated part of it.",
  "algorithm": "a finite, step-by-step procedure for solving a problem or completing a task.",
  "ecosystem": "a network of interdependent elements that function together as a system.",
  "sustainability": "the capacity to maintain a process over the long term without depleting it.",
  "globalization": "the increasing interconnection of economies, cultures, and societies across borders.",
  "inflation": "a sustained rise in the general price level that erodes the purchasing power of money.",
  "autonomy": "the capacity to govern oneself and act according to one's own reasons.",
  "consciousness": "the subjective state of being aware of one's own existence and surroundings.",
  "perception": "the process by which the brain organizes and interprets sensory information.",
  "neuroplasticity": "the brain's lifelong capacity to physically rewire its own synapses in response to experience.",
  "metacognition": "the awareness and understanding of one's own thought processes.",
  "context": "the surrounding circumstances that give a statement or event its full meaning.",
  "abstraction": "the process of stripping away specific detail to reveal a more general pattern.",
  "variable": "a factor or quantity that can change and that a study attempts to measure or control.",
  "anecdotal": "based on individual accounts or isolated examples rather than systematic evidence.",
  "subjective": "shaped by individual perspective or feeling rather than independent fact.",
  "objective": "existing independently of any one person's feelings or opinions.",
  "implicit": "implied or understood without being directly stated.",
  "explicit": "stated clearly and in detail, leaving little room for confusion.",
  "equilibrium": "a state of balance in which opposing forces or influences are level with one another.",
  "incentive": "something that motivates or encourages a particular action or behavior.",
  "externality": "a side effect of an activity that falls on people who did not choose to be involved.",
  "resilience": "the capacity to recover quickly from difficulty and return to a stable state.",
  "working memory": "the small, effortful mental workspace that holds and manipulates only a handful of ideas at once.",
  "default mode network": "a set of brain regions that quiets during focused effort and reawakens the moment a task ends and the mind drifts.",
  "prediction error": "the small gap between what the brain expected to know and what it now knows — the spark behind a feeling of understanding.",
  "confirmation bias": "the tendency to favor information that confirms what one already believes.",
  "feedback loop": "a cycle in which a system's output is returned as a new input, reinforcing or dampening itself.",
};

const LOGIC_PROMPT = { q: "Does the conclusion necessarily follow?" };
const EVIDENCE_PROMPT = { q: "What evidence would make you doubt this?" };
const VALUES_PROMPT = { q: "What values are being assumed here?" };

const SOCRATIC_BANK = [
  { q: "What's one assumption this paragraph makes that you hadn't questioned before?" },
  { q: "How would you explain this idea to someone else in a single sentence, without the jargon?" },
  { q: "Where have you personally seen this play out in your own life?" },
  { q: "What would someone who disagrees with this say in response?" },
  { q: "What question does this paragraph leave unanswered for you?" },
  { q: "If this idea is true, what should change about how you act tomorrow?" },
  { q: "What's the weakest part of the reasoning here?" },
  { q: "Does this confirm something you already believed, or complicate it?" },
  { q: "What's an example from outside this text that proves — or disproves — this point?" },
  { q: "What would you ask the author if they were sitting across from you right now?" },
  { q: "Which word in this paragraph carries the most weight, and why that one?" },
  { q: "Is this a fact, an opinion, or something in between?" },
];

function getPromptForParagraph(text, idx, offset) {
  const lower = text.toLowerCase();
  if (/\b(because|therefore|thus|hence)\b/.test(lower)) return LOGIC_PROMPT;
  if (/\b(study|studies|research|data|evidence|survey|experiment)\b/.test(lower)) return EVIDENCE_PROMPT;
  if (/\b(should|must|ought)\b/.test(lower)) return VALUES_PROMPT;
  return SOCRATIC_BANK[(idx + offset) % SOCRATIC_BANK.length];
}

const SAMPLE_TEXT = `The Architecture of Attention

Attention is the editor of experience. Of the millions of signals reaching a brain in any given second, only a vanishing fraction ever surfaces into conscious awareness — the rest is cut, silently, before a single frame reaches the screen of the mind. What survives that edit becomes, for all practical purposes, the only world that exists.

For most of the twentieth century, neuroscience treated the adult brain as something closer to a finished building than a living system — wired once in childhood, then left to slowly decay. That assumption has not survived contact with the evidence of neuroplasticity. The brain you have on a Friday evening is not, in any strict sense, identical to the one you woke up with on Monday.

Reading deeply and reading shakily feel similar from the outside, but they are different acts of engineering. Comprehension depends on holding several ideas active at once inside a famously small mental workspace — what cognitive scientists call working memory. Every needless interruption taxes that workspace until there is no room left for the sentence in front of you.

Yet the brain does not only do its best work while straining. Some of its most generative activity happens in the gaps — in the soft, undirected drift that takes over the instant a task ends. Neuroscientists trace this drift to the default mode network. A reading environment that never permits a pause is, in this sense, quietly fighting its own reader.

This is the quiet argument for calm design. A page that hums with progress bars, streaks, and pop-up encouragement is optimizing for attention capture, not comprehension — it wants you to stay, not necessarily to understand. A page built like a well-made notebook, by contrast, disappears.

Curiosity itself runs on a kind of forecasting error. The instant understanding arrives a half-second after a question forms, the brain registers a small mismatch between what it expected to know and what it now knows. Neuroscientists call this gap a prediction error, and it is a more reliable source of pleasure than the information ever was on its own.

None of this requires more willpower from the reader. It requires a different kind of page — one that trusts a person to go slowly, that turns difficulty into a single unobtrusive question rather than a wall, and that treats a margin not as decoration but as the place where a reader's own mind gets to speak back.`;

/* -----------------------------------------------------------
   Local storage helpers for Reflection Archive
----------------------------------------------------------- */
function loadArchive() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveToArchive(entry) {
  try {
    const existing = loadArchive();
    existing.unshift(entry);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch (e) {}
}

/* -----------------------------------------------------------
   Parsing + scanning helpers
----------------------------------------------------------- */
function prettifyFilename(name) {
  const base = name.replace(/\.[^/.]+$/, "");
  return (
    base
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Imported File"
  );
}

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (e) {
    return null;
  }
}

function parseImportedText(rawInput, fallbackTitle) {
  let text = rawInput.replace(/\r\n/g, "\n").trim();
  let title = fallbackTitle || "Imported Reading";

  const titleMatch = text.match(/^Title:\s*(.+)$/m);
  if (titleMatch && titleMatch[1].trim()) title = titleMatch[1].trim();
  const marker = text.indexOf("Markdown Content:");
  if (marker !== -1) text = text.slice(marker + "Markdown Content:".length).trim();

  let paras = text.split(/\n\s*\n+/).map((s) => s.replace(/[ \t]+/g, " ").trim()).filter(Boolean);
  if (paras.length <= 1) paras = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);

  paras = paras
    .map((p) =>
      p
        .replace(/^#+\s*/, "")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/^[-*]\s+/, "")
        .trim()
    )
    .filter((p) => p.length > 1);

  if (!titleMatch && paras.length > 1 && paras[0].length < 90 && !/[.!?]$/.test(paras[0])) {
    title = paras[0];
    paras = paras.slice(1);
  }

  const truncated = paras.length > MAX_PARAGRAPHS;
  if (truncated) paras = paras.slice(0, MAX_PARAGRAPHS);

  return { title, paragraphs: paras, truncated };
}

function buildSegments(paragraphs) {
  const used = new Set();
  const keys = Object.keys(TERM_DICTIONARY).sort((a, b) => b.length - a.length);
  const escaped = keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");

  return paragraphs.map((text, idx) => {
    const segments = [];
    let lastIndex = 0;
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      const key = match[0].toLowerCase();
      if (!TERM_DICTIONARY[key] || used.has(key) || used.size >= MAX_XRAY_TERMS) continue;
      const start = match.index;
      const end = start + match[0].length;
      if (start > lastIndex) segments.push({ type: "text", content: text.slice(lastIndex, start) });
      segments.push({ type: "term", key, label: match[0], definition: TERM_DICTIONARY[key] });
      used.add(key);
      lastIndex = end;
    }
    if (lastIndex < text.length) segments.push({ type: "text", content: text.slice(lastIndex) });
    if (segments.length === 0) segments.push({ type: "text", content: text });
    return { id: idx, segments, plainText: text };
  });
}

/* -----------------------------------------------------------
   X-Ray term
----------------------------------------------------------- */
function TermSpan({ id, label, definition, expandedTerm, setExpandedTerm }) {
  const isOpen = expandedTerm === id;
  return (
    <span style={{ position: "relative" }}>
      <span
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={(e) => { e.stopPropagation(); setExpandedTerm(isOpen ? null : id); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedTerm(isOpen ? null : id); } }}
        className="cr-term"
        style={{ borderBottom: `1.5px dashed ${PALETTE.clay}`, color: PALETTE.clay, cursor: "pointer", paddingBottom: 1 }}
      >
        {label}
      </span>
      <span style={{ display: "inline-grid", gridTemplateRows: isOpen ? "1fr" : "0fr", width: "100%", transition: "grid-template-rows 420ms cubic-bezier(0.4,0,0.2,1)" }}>
        <span style={{ overflow: "hidden" }}>
          <span style={{ display: "block", margin: "10px 0 6px", padding: "12px 16px", background: PALETTE.paperSoft, borderLeft: `3px solid ${PALETTE.clay}`, borderRadius: 6, fontFamily: FONT_SANS, fontStyle: "italic", fontSize: "0.82em", color: PALETTE.ink, opacity: 0.88, lineHeight: 1.55 }}>
            {definition}
          </span>
        </span>
      </span>
    </span>
  );
}

/* -----------------------------------------------------------
   Paragraph — opacity controlled by deepFocus + scroll position
----------------------------------------------------------- */
function Paragraph({ id, segments, fontSize, opacity, deepFocus, socraticMode, highlighted, onToggleHighlight, paragraphRef, expandedTerm, setExpandedTerm, delay }) {
  const effectiveOpacity = deepFocus ? opacity : 1;
  return (
    <p
      ref={paragraphRef}
      data-pid={id}
      className="cr-fade-up"
      style={{ animationDelay: `${delay}ms`, touchAction: "manipulation" }}
      onClick={() => { if (socraticMode) onToggleHighlight(id); }}
    >
      <span
        style={{
          display: "block",
          fontFamily: FONT_SERIF,
          fontSize,
          lineHeight: 1.85,
          color: PALETTE.ink,
          opacity: effectiveOpacity,
          background: highlighted ? "rgba(107,122,94,0.09)" : "transparent",
          borderLeft: `3px solid ${highlighted ? PALETTE.moss : "transparent"}`,
          borderRadius: 4,
          padding: "2px 16px",
          marginLeft: -16,
          cursor: socraticMode ? "pointer" : "default",
          transition: "opacity 700ms ease, background-color 450ms ease, border-color 450ms ease",
        }}
      >
        {segments.map((seg, i) =>
          seg.type === "term" ? (
            <TermSpan key={i} id={seg.key} label={seg.label} definition={seg.definition} expandedTerm={expandedTerm} setExpandedTerm={setExpandedTerm} />
          ) : (
            <React.Fragment key={i}>{seg.content}</React.Fragment>
          )
        )}
      </span>
    </p>
  );
}

/* -----------------------------------------------------------
   Pause Point — now with active recall input
----------------------------------------------------------- */
function PausePoint({ pauseIdx, onRecall }) {
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
        <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, color: PALETTE.inkFaint, letterSpacing: 0.3, marginBottom: 8 }}>Pause.</p>
        <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, color: PALETTE.inkFaint, lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>
          Without looking back — what do you remember?
        </p>
      </div>
      {!saved ? (
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
            placeholder="One thing…"
            rows={2}
            style={{ flex: 1, resize: "none", background: PALETTE.paperSoft, border: `1px solid ${PALETTE.paperDeep}`, borderRadius: 10, padding: "10px 14px", fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.6, color: PALETTE.ink, outline: "none", boxSizing: "border-box" }}
          />
          <button
            onClick={handleSave}
            disabled={!val.trim()}
            className="cr-no-select"
            style={{ padding: "10px 18px", borderRadius: 999, border: "none", background: val.trim() ? PALETTE.moss : PALETTE.paperDeep, color: val.trim() ? PALETTE.paper : PALETTE.inkFaint, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, cursor: val.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap", marginTop: 2 }}
          >
            Save
          </button>
        </div>
      ) : (
        <p style={{ textAlign: "center", fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 14, color: PALETTE.moss }}>
          Noted. Keep reading.
        </p>
      )}
    </div>
  );
}

/* Typographic position marker */
function ProgressMarker({ phase, fraction }) {
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

/* Breath transition */
function ReadingRitual({ visible, minutes }) {
  return (
    <div
      aria-hidden={!visible}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: PALETTE.paper,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 900ms ease",
      }}
    >
      <div style={{ textAlign: "center", padding: 24 }}>
        <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: "clamp(20px,4vw,26px)", color: PALETTE.ink, marginBottom: 14 }}>
          Take a slow breath.
        </p>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: PALETTE.inkFaint }}>
          This will take about {minutes} minute{minutes === 1 ? "" : "s"} to read.
        </p>
      </div>
    </div>
  );
}

/* Desktop margin note with insight input */
function MarginNote({ text, top, onSaveInsight }) {
  const [val, setVal] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!val.trim()) return;
    onSaveInsight(val.trim());
    setSaved(true);
  };

  return (
    <div style={{ position: "absolute", top, left: 0, width: "100%" }}>
      <div className="cr-margin-in" style={{ borderLeft: `2px solid ${PALETTE.moss}`, paddingLeft: 16 }}>
        <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.6, color: PALETTE.mossDeep, margin: "0 0 10px" }}>
          {text}
        </p>
        {!saved ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <textarea
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
              placeholder="Your insight…"
              rows={2}
              style={{ resize: "none", background: PALETTE.paperSoft, border: `1px solid ${PALETTE.paperDeep}`, borderRadius: 8, padding: "8px 10px", fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.5, color: PALETTE.ink, outline: "none", width: "100%", boxSizing: "border-box" }}
            />
            <button
              onClick={handleSave}
              disabled={!val.trim()}
              className="cr-no-select"
              style={{ alignSelf: "flex-end", padding: "6px 14px", borderRadius: 999, border: "none", background: val.trim() ? PALETTE.moss : PALETTE.paperDeep, color: val.trim() ? PALETTE.paper : PALETTE.inkFaint, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 12, cursor: val.trim() ? "pointer" : "not-allowed" }}
            >
              Add to ledger
            </button>
          </div>
        ) : (
          <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 13, color: PALETTE.moss }}>Saved.</p>
        )}
      </div>
    </div>
  );
}

/* Phone bottom sheet with insight input */
function BottomSheet({ open, text, onClose, onSaveInsight }) {
  const [val, setVal] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) { setVal(""); setSaved(false); }
  }, [open]);

  const handleSave = () => {
    if (!val.trim()) return;
    onSaveInsight(val.trim());
    setSaved(true);
  };

  return (
    <>
      <div onClick={onClose} aria-hidden={!open} style={{ position: "fixed", inset: 0, background: "rgba(44,48,58,0.28)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 320ms ease", zIndex: 60 }} />
      <div
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 61,
          background: PALETTE.paperSoft, borderTopLeftRadius: 22, borderTopRightRadius: 22,
          boxShadow: "0 -12px 32px rgba(44,48,58,0.18)",
          padding: "12px 24px calc(30px + env(safe-area-inset-bottom, 0px))",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 420ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <button onClick={onClose} aria-label="Close prompt" className="cr-iconbtn" style={{ width: 36, height: 4, borderRadius: 2, background: PALETTE.paperDeep, margin: "4px auto 20px", display: "block", border: "none", padding: 0 }} />
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
          <span style={{ fontSize: 17, lineHeight: 1, color: PALETTE.moss, marginTop: 3 }}>✦</span>
          <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 18, lineHeight: 1.6, color: PALETTE.mossDeep, margin: 0 }}>{text}</p>
        </div>
        {!saved ? (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <textarea
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
              placeholder="Your insight in one sentence…"
              rows={2}
              style={{ flex: 1, resize: "none", background: PALETTE.paper, border: `1px solid ${PALETTE.paperDeep}`, borderRadius: 10, padding: "10px 14px", fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: PALETTE.ink, outline: "none", boxSizing: "border-box" }}
            />
            <button
              onClick={handleSave}
              disabled={!val.trim()}
              className="cr-no-select"
              style={{ padding: "10px 16px", borderRadius: 999, border: "none", background: val.trim() ? PALETTE.moss : PALETTE.paperDeep, color: val.trim() ? PALETTE.paper : PALETTE.inkFaint, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, cursor: val.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap", marginTop: 2 }}
            >
              Save
            </button>
          </div>
        ) : (
          <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 14, color: PALETTE.moss, margin: 0 }}>Saved to your ledger.</p>
        )}
      </div>
    </>
  );
}

/* -----------------------------------------------------------
   Wisdom Ledger — user-generated insights + search
----------------------------------------------------------- */
function WisdomLedgerPanel({ open, insights, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? insights.filter((ins) => ins.text.toLowerCase().includes(search.toLowerCase()) || (ins.title || "").toLowerCase().includes(search.toLowerCase()))
    : insights;

  return (
    <>
      <div onClick={onClose} aria-hidden={!open} style={{ position: "fixed", inset: 0, background: "rgba(44,48,58,0.22)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 320ms ease", zIndex: 62 }} />
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 63,
          width: "min(400px, 92vw)", background: PALETTE.paperSoft,
          borderLeft: `1px solid ${PALETTE.paperDeep}`, boxShadow: "-12px 0 32px rgba(44,48,58,0.14)",
          padding: "26px 24px", overflowY: "auto",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 420ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontFamily: FONT_SERIF, fontSize: 20, color: PALETTE.ink, margin: 0 }}>Wisdom Ledger</h2>
          <button onClick={onClose} aria-label="Close ledger" className="cr-no-select" style={{ background: "transparent", border: "none", fontSize: 20, color: PALETTE.inkFaint, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {insights.length > 3 && (
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your thoughts…"
            style={{ width: "100%", background: PALETTE.paper, border: `1px solid ${PALETTE.paperDeep}`, borderRadius: 10, padding: "9px 14px", fontFamily: FONT_SANS, fontSize: 14, color: PALETTE.ink, outline: "none", boxSizing: "border-box", marginBottom: 18 }}
          />
        )}

        {filtered.length === 0 && insights.length === 0 ? (
          <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: PALETTE.inkFaint, lineHeight: 1.6 }}>
            Turn on Socratic Margin and tap a paragraph. Write your own insight — it collects here.
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: PALETTE.inkFaint }}>No matches for "{search}".</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filtered.map((ins, i) => (
              <li key={i} className="cr-fade-up" style={{ marginBottom: 22, paddingBottom: 22, borderBottom: i < filtered.length - 1 ? `1px solid ${PALETTE.paperDeep}` : "none" }}>
                {ins.title && (
                  <p style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: PALETTE.clay, margin: "0 0 5px" }}>{ins.title}</p>
                )}
                <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.6, color: PALETTE.ink, margin: "0 0 4px" }}>{ins.text}</p>
                {ins.date && (
                  <p style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: PALETTE.inkFaint, margin: 0 }}>{ins.date}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* -----------------------------------------------------------
   Reflection Archive — all insights across all sessions
----------------------------------------------------------- */
function ArchivePanel({ open, onClose }) {
  const [search, setSearch] = useState("");
  const [archive, setArchive] = useState([]);

  useEffect(() => {
    if (open) setArchive(loadArchive());
  }, [open]);

  const filtered = search.trim()
    ? archive.filter((e) => e.text.toLowerCase().includes(search.toLowerCase()) || (e.title || "").toLowerCase().includes(search.toLowerCase()))
    : archive;

  return (
    <>
      <div onClick={onClose} aria-hidden={!open} style={{ position: "fixed", inset: 0, background: "rgba(44,48,58,0.22)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 320ms ease", zIndex: 62 }} />
      <div
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 63,
          width: "min(400px, 92vw)", background: PALETTE.paperSoft,
          borderRight: `1px solid ${PALETTE.paperDeep}`, boxShadow: "12px 0 32px rgba(44,48,58,0.14)",
          padding: "26px 24px", overflowY: "auto",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 420ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontFamily: FONT_SERIF, fontSize: 20, color: PALETTE.ink, margin: 0 }}>Reflection Archive</h2>
          <button onClick={onClose} aria-label="Close archive" className="cr-no-select" style={{ background: "transparent", border: "none", fontSize: 20, color: PALETTE.inkFaint, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search all reflections…"
          style={{ width: "100%", background: PALETTE.paper, border: `1px solid ${PALETTE.paperDeep}`, borderRadius: 10, padding: "9px 14px", fontFamily: FONT_SANS, fontSize: 14, color: PALETTE.ink, outline: "none", boxSizing: "border-box", marginBottom: 18 }}
        />

        {filtered.length === 0 && archive.length === 0 ? (
          <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: PALETTE.inkFaint, lineHeight: 1.7 }}>
            Your reflections from every reading session will appear here — searchable, forever.
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: PALETTE.inkFaint }}>No matches for "{search}".</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filtered.map((entry, i) => (
              <li key={i} style={{ marginBottom: 22, paddingBottom: 22, borderBottom: i < filtered.length - 1 ? `1px solid ${PALETTE.paperDeep}` : "none" }}>
                {entry.title && (
                  <p style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: PALETTE.clay, margin: "0 0 5px" }}>{entry.title}</p>
                )}
                <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.6, color: PALETTE.ink, margin: "0 0 4px" }}>{entry.text}</p>
                <p style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: PALETTE.inkFaint, margin: 0 }}>{entry.date}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function ToggleSwitch({ label, checked, onChange }) {
  return (
    <button onClick={onChange} className="cr-iconbtn cr-no-select" style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 8 }} aria-pressed={checked}>
      <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: PALETTE.ink, letterSpacing: 0.2 }}>{label}</span>
      <span style={{ width: 38, height: 22, borderRadius: 11, background: checked ? PALETTE.moss : PALETTE.paperDeep, position: "relative", transition: "background 300ms ease", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 2, left: checked ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: PALETTE.paper, transition: "left 300ms cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 1px 2px rgba(0,0,0,0.18)" }} />
      </span>
    </button>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 300ms ease" }}>
      <path d="M2 4.5L7 9.5L12 4.5" stroke={PALETTE.paper} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -----------------------------------------------------------
   Importer Canvas
----------------------------------------------------------- */
function ImporterCanvas({ onLoad }) {
  const [tab, setTab] = useState("paste");
  const [pasteValue, setPasteValue] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setFileError(null);
    const reader = new FileReader();
    reader.onload = (e) => onLoad(String(e.target.result || ""), prettifyFilename(file.name));
    reader.onerror = () => setFileError("Couldn't read that file — try a plain .txt or .md file instead.");
    reader.readAsText(file);
  };

  const handleFetchUrl = async () => {
    const raw = urlValue.trim();
    if (!raw) return;
    let normalized = raw;
    if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;
    try { new URL(normalized); } catch (e) { setFetchError("That doesn't look like a valid web address."); return; }
    setIsFetching(true);
    setFetchError(null);
    try {
      const res = await fetch("https://r.jina.ai/" + normalized);
      if (!res.ok) throw new Error("bad response");
      const text = await res.text();
      if (!text || text.trim().length < 40) throw new Error("empty");
      onLoad(text, hostnameFromUrl(normalized) || "Imported Link");
    } catch (err) {
      setFetchError("Couldn't fetch that page directly — paste its text instead, or try a different link.");
    } finally {
      setIsFetching(false);
    }
  };

  const tabBtnStyle = (active) => ({
    flex: 1, padding: "10px 0", borderRadius: 999, border: "none",
    fontFamily: FONT_SANS, fontSize: 13.5, fontWeight: 600, letterSpacing: 0.2, cursor: "pointer",
    color: active ? PALETTE.paper : PALETTE.ink, background: active ? PALETTE.moss : "transparent",
    transition: "background 250ms ease, color 250ms ease",
  });

  return (
    <div className="cr-fade-up" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 600, fontSize: "clamp(26px,5vw,34px)", color: PALETTE.ink, textAlign: "center", marginBottom: 10, lineHeight: 1.25 }}>
          What would you like to read?
        </h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14.5, color: PALETTE.inkFaint, textAlign: "center", marginBottom: 32, lineHeight: 1.6 }}>
          Paste text, drop a file, or bring in a link — Calm Reader turns it into a quiet, focused page.
        </p>

        <div style={{ display: "flex", gap: 6, background: PALETTE.paperSoft, borderRadius: 999, padding: 5, marginBottom: 22 }}>
          <button className="cr-no-select" style={tabBtnStyle(tab === "paste")} onClick={() => setTab("paste")}>Paste</button>
          <button className="cr-no-select" style={tabBtnStyle(tab === "url")} onClick={() => setTab("url")}>Link</button>
          <button className="cr-no-select" style={tabBtnStyle(tab === "upload")} onClick={() => setTab("upload")}>Upload</button>
        </div>

        {tab === "paste" && (
          <div>
            <textarea
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              placeholder="Paste an article, an excerpt, your notes — anything you want to read calmly."
              rows={9}
              style={{ width: "100%", resize: "vertical", background: PALETTE.paperSoft, border: `1px solid ${PALETTE.paperDeep}`, borderRadius: 14, padding: 16, fontFamily: FONT_SANS, fontSize: 16, lineHeight: 1.6, color: PALETTE.ink, outline: "none", boxSizing: "border-box" }}
            />
            <button
              disabled={!pasteValue.trim()}
              onClick={() => onLoad(pasteValue, "Imported Reading")}
              className="cr-no-select"
              style={{ width: "100%", marginTop: 14, padding: "13px 0", borderRadius: 999, border: "none", background: pasteValue.trim() ? PALETTE.moss : PALETTE.paperDeep, color: pasteValue.trim() ? PALETTE.paper : PALETTE.inkFaint, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14.5, cursor: pasteValue.trim() ? "pointer" : "not-allowed", transition: "background 250ms ease, color 250ms ease" }}
            >
              Begin Reading
            </button>
          </div>
        )}

        {tab === "url" && (
          <div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                placeholder="https://example.com/an-article-worth-reading"
                style={{ flex: "1 1 240px", background: PALETTE.paperSoft, border: `1px solid ${PALETTE.paperDeep}`, borderRadius: 12, padding: "13px 16px", fontFamily: FONT_SANS, fontSize: 16, color: PALETTE.ink, outline: "none", boxSizing: "border-box" }}
              />
              <button
                onClick={handleFetchUrl}
                disabled={!urlValue.trim() || isFetching}
                className="cr-no-select"
                style={{ padding: "13px 22px", borderRadius: 999, border: "none", background: urlValue.trim() ? PALETTE.moss : PALETTE.paperDeep, color: urlValue.trim() ? PALETTE.paper : PALETTE.inkFaint, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14.5, cursor: urlValue.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}
              >
                {isFetching ? "Fetching…" : "Fetch & Read"}
              </button>
            </div>
            {fetchError && <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: PALETTE.clay, marginTop: 10, lineHeight: 1.5 }}>{fetchError}</p>}
            <p style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: PALETTE.inkFaint, marginTop: 10, lineHeight: 1.5 }}>
              Some sites block outside requests — if a link won't load, pasting its text usually works better.
            </p>
          </div>
        )}

        {tab === "upload" && (
          <div>
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files && e.dataTransfer.files[0]); }}
              style={{ border: `1.5px dashed ${dragActive ? PALETTE.moss : PALETTE.clay}`, borderRadius: 16, background: dragActive ? PALETTE.paperSoft : "transparent", padding: "40px 20px", textAlign: "center", cursor: "pointer", transition: "background 250ms ease, border-color 250ms ease" }}
            >
              <div style={{ fontSize: 26, color: PALETTE.clay, marginBottom: 10 }}>↥</div>
              <p style={{ fontFamily: FONT_SANS, fontSize: 14.5, color: PALETTE.ink, margin: 0 }}>Drop a .txt or .md file here, or tap to browse.</p>
              <input ref={fileInputRef} type="file" accept=".txt,.md,text/plain,text/markdown" onChange={(e) => handleFile(e.target.files && e.target.files[0])} style={{ display: "none" }} />
            </div>
            {fileError && <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: PALETTE.clay, marginTop: 10 }}>{fileError}</p>}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button onClick={() => onLoad(SAMPLE_TEXT, null)} className="cr-no-select" style={{ background: "transparent", border: "none", fontFamily: FONT_SANS, fontSize: 13.5, color: PALETTE.mossDeep, textDecoration: "underline", textDecorationColor: PALETTE.paperDeep, cursor: "pointer" }}>
            or try a sample passage →
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Main component
----------------------------------------------------------- */
export default function CalmReader() {
  const [importedRaw, setImportedRaw] = useState(null);
  const [importHint, setImportHint] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [socraticMode, setSocraticMode] = useState(false);
  const [deepFocus, setDeepFocus] = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const [expandedTerm, setExpandedTerm] = useState(null);
  const [marginTop, setMarginTop] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleIds, setVisibleIds] = useState(new Set());
  // insights = array of { text, title, date }
  const [insights, setInsights] = useState([]);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");

  const containerRef = useRef(null);
  const paragraphRefs = useRef({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobile && socraticMode && highlighted !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, socraticMode, highlighted]);

  const doc = useMemo(() => {
    if (!importedRaw) return null;
    const { title, paragraphs, truncated } = parseImportedText(importedRaw, importHint);
    const withSegments = buildSegments(paragraphs);
    const wordCount = paragraphs.reduce((acc, p) => acc + p.split(/\s+/).filter(Boolean).length, 0);
    const readMins = Math.max(1, Math.round(wordCount / 200));
    return { title, paragraphs: withSegments, truncated, readMins };
  }, [importedRaw, importHint]);

  const socraticOffset = useMemo(() => Math.floor(Math.random() * SOCRATIC_BANK.length), [importedRaw]);
  const getPromptData = (para) => getPromptForParagraph(para.plainText, para.id, socraticOffset);

  /* Flow Focus / Deep Focus */
  useEffect(() => {
    if (!doc) return;
    const els = Object.values(paragraphRefs.current).filter(Boolean);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const id = Number(entry.target.getAttribute("data-pid"));
            if (entry.isIntersecting) next.add(id);
            else next.delete(id);
          });
          return next;
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [doc]);

  const currentIndex = visibleIds.size ? Math.min(...visibleIds) : 0;
  const totalParagraphs = doc ? doc.paragraphs.length : 1;
  const fraction = totalParagraphs > 1 ? currentIndex / (totalParagraphs - 1) : 0;
  const phase = fraction < 0.33 ? "Beginning" : fraction < 0.7 ? "Middle" : "Reflection";

  useEffect(() => {
    if (highlighted !== null && paragraphRefs.current[highlighted] && containerRef.current) {
      const pRect = paragraphRefs.current[highlighted].getBoundingClientRect();
      const cRect = containerRef.current.getBoundingClientRect();
      setMarginTop(pRect.top - cRect.top);
    }
  }, [highlighted, fontSizeIdx, isMobile]);

  /* Save a user-written insight */
  const saveInsight = useCallback((text) => {
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const entry = { text, title: currentTitle, date };
    setInsights((prev) => [...prev, entry]);
    saveToArchive(entry);
  }, [currentTitle]);

  /* Save a recall from a Pause Point */
  const saveRecall = useCallback((text) => {
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const entry = { text, title: currentTitle ? `${currentTitle} — recall` : "Recall", date };
    setInsights((prev) => [...prev, entry]);
    saveToArchive(entry);
  }, [currentTitle]);

  const toggleHighlight = (id) => setHighlighted((prev) => (prev === id ? null : id));

  const handleLoad = (raw, hint) => {
    if (!raw || !raw.trim()) return;
    paragraphRefs.current = {};
    setVisibleIds(new Set());
    setInsights([]);
    setLedgerOpen(false);
    setImportHint(hint);
    setImportedRaw(raw);
    setHighlighted(null);
    setExpandedTerm(null);
    setDrawerOpen(false);
    setRitual(true);
    setTimeout(() => setRitual(false), 3000);
  };

  useEffect(() => {
    if (doc) setCurrentTitle(doc.title);
  }, [doc]);

  const backToImporter = () => {
    paragraphRefs.current = {};
    setVisibleIds(new Set());
    setInsights([]);
    setLedgerOpen(false);
    setImportedRaw(null);
    setHighlighted(null);
    setExpandedTerm(null);
    setDrawerOpen(false);
    setSocraticMode(false);
    setDeepFocus(false);
    setRitual(false);
  };

  const globalCss = `
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

  if (!doc) {
    return (
      <div style={{ minHeight: "100vh", background: PALETTE.paper, backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%)" }}>
        <style>{globalCss}</style>
        {/* Archive button on import screen */}
        <button onClick={() => setArchiveOpen(true)} aria-label="Open reflection archive" className="cr-iconbtn cr-no-select" style={{ position: "fixed", top: 14, left: 14, zIndex: 45, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(241,236,224,0.85)", color: PALETTE.mossDeep, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, opacity: 0.7 }}>
          ✎
        </button>
        <ImporterCanvas onLoad={handleLoad} />
        <ArchivePanel open={archiveOpen} onClose={() => setArchiveOpen(false)} />
      </div>
    );
  }

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
      rows.push(<PausePoint key={`pause-${i}`} pauseIdx={i} onRecall={saveRecall} />);
    }
  });

  const promptText = highlighted !== null ? getPromptData(doc.paragraphs.find((p) => p.id === highlighted)).q : "";

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.paper, backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%)", position: "relative" }}>
      <style>{globalCss}</style>

      <ReadingRitual visible={ritual} minutes={doc.readMins} />

      {/* Back to importer */}
      <button onClick={backToImporter} aria-label="Import a different text" className="cr-iconbtn cr-no-select" style={{ position: "fixed", top: 14, left: 14, zIndex: 45, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(241,236,224,0.85)", color: PALETTE.ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0.55, fontSize: 16 }}>
        ←
      </button>

      {/* Reflection archive access (bottom-left) */}
      <button onClick={() => setArchiveOpen(true)} aria-label="Open reflection archive" className="cr-iconbtn cr-no-select" style={{ position: "fixed", bottom: 18, left: 14, zIndex: 45, padding: "7px 14px", borderRadius: 999, border: `1px solid ${PALETTE.paperDeep}`, background: "rgba(241,236,224,0.85)", color: PALETTE.mossDeep, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", opacity: 0.7, fontFamily: FONT_SANS, fontSize: 12 }}>
        <span style={{ fontSize: 13 }}>☍</span> Archive
      </button>

      {/* Wisdom Ledger access */}
      <button onClick={() => setLedgerOpen(true)} aria-label={`Wisdom Ledger, ${insights.length} insight${insights.length === 1 ? "" : "s"} collected`} className="cr-iconbtn cr-no-select" style={{ position: "fixed", top: 14, right: 14, zIndex: 45, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(241,236,224,0.85)", color: PALETTE.moss, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: insights.length > 0 ? 0.9 : 0.5, fontSize: 15 }}>
        ✎
        {insights.length > 0 && (
          <span style={{ position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: PALETTE.clay, color: PALETTE.paper, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS }}>
            {insights.length}
          </span>
        )}
      </button>

      {/* Ribbon pull-tab */}
      <button className="cr-ribbon cr-no-select" aria-label={drawerOpen ? "Close reading controls" : "Open reading controls"} onClick={() => setDrawerOpen((o) => !o)} style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 50, width: 60, height: 28, background: PALETTE.moss, border: "none", clipPath: "polygon(0 0, 100% 0, 100% 76%, 50% 100%, 0 76%)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <ChevronIcon open={drawerOpen} />
      </button>

      {/* Drawer */}
      <div aria-hidden={!drawerOpen} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, background: PALETTE.paperSoft, borderBottom: `1px solid ${PALETTE.paperDeep}`, boxShadow: drawerOpen ? "0 10px 28px rgba(44,48,58,0.10)" : "none", transform: drawerOpen ? "translateY(0)" : "translateY(-100%)", transition: "transform 460ms cubic-bezier(0.22,1,0.36,1), box-shadow 460ms ease" }}>
        <div className="flex items-center justify-center flex-wrap" style={{ maxWidth: 780, margin: "0 auto", padding: "22px 28px 10px", gap: 22 }}>
          <div className="flex items-center" style={{ gap: 12 }}>
            <button className="cr-iconbtn cr-no-select" disabled={fontSizeIdx === 0} onClick={() => setFontSizeIdx((i) => Math.max(0, i - 1))} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${PALETTE.paperDeep}`, background: PALETTE.paper, color: PALETTE.ink, fontFamily: FONT_SANS, fontSize: 13, cursor: fontSizeIdx === 0 ? "not-allowed" : "pointer", opacity: fontSizeIdx === 0 ? 0.35 : 1 }}>A−</button>
            <span style={{ fontFamily: FONT_SERIF, color: PALETTE.ink, fontSize: 20, minWidth: 22, textAlign: "center" }}>Aa</span>
            <button className="cr-iconbtn cr-no-select" disabled={fontSizeIdx === FONT_SIZES.length - 1} onClick={() => setFontSizeIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${PALETTE.paperDeep}`, background: PALETTE.paper, color: PALETTE.ink, fontFamily: FONT_SANS, fontSize: 13, cursor: fontSizeIdx === FONT_SIZES.length - 1 ? "not-allowed" : "pointer", opacity: fontSizeIdx === FONT_SIZES.length - 1 ? 0.35 : 1 }}>A+</button>
          </div>
          <div style={{ width: 1, height: 24, background: PALETTE.paperDeep }} />
          <ToggleSwitch label="Socratic Margin" checked={socraticMode} onChange={() => { setSocraticMode((v) => !v); setHighlighted(null); }} />
          <div style={{ width: 1, height: 24, background: PALETTE.paperDeep }} />
          <ToggleSwitch label="Deep Focus" checked={deepFocus} onChange={() => setDeepFocus((v) => !v)} />
        </div>
        <p style={{ textAlign: "center", fontFamily: FONT_SANS, fontStyle: "italic", fontSize: 11.5, color: PALETTE.inkFaint, margin: "0 0 16px" }}>
          {deepFocus ? "Dimming nearby paragraphs to keep you in flow." : "Deep Focus dims surrounding paragraphs as you read."}
        </p>
      </div>

      {/* Reading canvas */}
      <div ref={containerRef} className="flex justify-center" style={{ position: "relative", maxWidth: 920, margin: "0 auto", paddingLeft: 24, paddingRight: 24, gap: 40 }}>
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

          <div style={{ textAlign: "center", marginTop: 48, color: PALETTE.inkFaint, fontSize: 20 }}>❧</div>
          {insights.length > 0 && (
            <p style={{ textAlign: "center", marginTop: 18, fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 14.5, color: PALETTE.inkFaint }}>
              Today you left with {insights.length} insight{insights.length === 1 ? "" : "s"}.
            </p>
          )}
        </div>

        {!isMobile && (
          <div style={{ width: 240, flexShrink: 0, position: "relative" }}>
            {socraticMode && highlighted !== null && (
              <MarginNote
                key={highlighted}
                top={marginTop}
                text={promptText}
                onSaveInsight={saveInsight}
              />
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
