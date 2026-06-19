import React, { useState, useRef } from "react";
import { PALETTE, FONT_SERIF, FONT_SANS } from "../data/constants.js";
import { prettifyFilename, hostnameFromUrl } from "../utils/text.js";
import { SAMPLE_TEXT } from "../data/sample.js";

const TAB_BTN_STYLE = (active) => ({
  flex: 1,
  padding: "10px 0",
  borderRadius: 999,
  border: "none",
  fontFamily: FONT_SANS,
  fontSize: 13.5,
  fontWeight: 600,
  letterSpacing: 0.2,
  cursor: "pointer",
  color: active ? PALETTE.paper : PALETTE.ink,
  background: active ? PALETTE.moss : "transparent",
  transition: "background 250ms ease, color 250ms ease",
});

export default function ImporterCanvas({ onLoad }) {
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
    reader.onload = (e) =>
      onLoad(String(e.target.result || ""), prettifyFilename(file.name));
    reader.onerror = () =>
      setFileError("Couldn't read that file — try a plain .txt or .md file instead.");
    reader.readAsText(file);
  };

  const handleFetchUrl = async () => {
    const raw = urlValue.trim();
    if (!raw) return;
    let normalized = raw;
    if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;
    try {
      new URL(normalized);
    } catch {
      setFetchError("That doesn't look like a valid web address.");
      return;
    }
    setIsFetching(true);
    setFetchError(null);
    try {
      const res = await fetch("https://r.jina.ai/" + normalized);
      if (!res.ok) throw new Error("bad response");
      const text = await res.text();
      if (!text || text.trim().length < 40) throw new Error("empty");
      onLoad(text, hostnameFromUrl(normalized) || "Imported Link");
    } catch {
      setFetchError(
        "Couldn't fetch that page directly — paste its text instead, or try a different link."
      );
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div
      className="cr-fade-up"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <h1
          style={{
            fontFamily: FONT_SERIF,
            fontWeight: 600,
            fontSize: "clamp(26px,5vw,34px)",
            color: PALETTE.ink,
            textAlign: "center",
            marginBottom: 10,
            lineHeight: 1.25,
          }}
        >
          What would you like to read?
        </h1>
        <p
          style={{
            fontFamily: FONT_SANS,
            fontSize: 14.5,
            color: PALETTE.inkFaint,
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          Paste text, drop a file, or bring in a link — CalmReader turns it into a quiet,
          focused page.
        </p>

        {/* Tab bar */}
        <div
          role="tablist"
          style={{
            display: "flex",
            gap: 6,
            background: PALETTE.paperSoft,
            borderRadius: 999,
            padding: 5,
            marginBottom: 22,
          }}
        >
          {["paste", "url", "upload"].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className="cr-no-select"
              style={TAB_BTN_STYLE(tab === t)}
              onClick={() => setTab(t)}
            >
              {t === "paste" ? "Paste" : t === "url" ? "Link" : "Upload"}
            </button>
          ))}
        </div>

        {/* Paste tab */}
        {tab === "paste" && (
          <div role="tabpanel">
            <textarea
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              placeholder="Paste an article, an excerpt, your notes — anything you want to read calmly."
              rows={9}
              aria-label="Paste text to read"
              style={{
                width: "100%",
                resize: "vertical",
                background: PALETTE.paperSoft,
                border: `1px solid ${PALETTE.paperDeep}`,
                borderRadius: 14,
                padding: 16,
                fontFamily: FONT_SANS,
                fontSize: 16,
                lineHeight: 1.6,
                color: PALETTE.ink,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              disabled={!pasteValue.trim()}
              onClick={() => onLoad(pasteValue, "Imported Reading")}
              className="cr-no-select"
              style={{
                width: "100%",
                marginTop: 14,
                padding: "13px 0",
                borderRadius: 999,
                border: "none",
                background: pasteValue.trim() ? PALETTE.moss : PALETTE.paperDeep,
                color: pasteValue.trim() ? PALETTE.paper : PALETTE.inkFaint,
                fontFamily: FONT_SANS,
                fontWeight: 600,
                fontSize: 14.5,
                cursor: pasteValue.trim() ? "pointer" : "not-allowed",
                transition: "background 250ms ease, color 250ms ease",
              }}
            >
              Begin Reading
            </button>
          </div>
        )}

        {/* URL tab */}
        {tab === "url" && (
          <div role="tabpanel">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                placeholder="https://example.com/an-article-worth-reading"
                aria-label="Article URL"
                style={{
                  flex: "1 1 240px",
                  background: PALETTE.paperSoft,
                  border: `1px solid ${PALETTE.paperDeep}`,
                  borderRadius: 12,
                  padding: "13px 16px",
                  fontFamily: FONT_SANS,
                  fontSize: 16,
                  color: PALETTE.ink,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleFetchUrl}
                disabled={!urlValue.trim() || isFetching}
                className="cr-no-select"
                style={{
                  padding: "13px 22px",
                  borderRadius: 999,
                  border: "none",
                  background: urlValue.trim() ? PALETTE.moss : PALETTE.paperDeep,
                  color: urlValue.trim() ? PALETTE.paper : PALETTE.inkFaint,
                  fontFamily: FONT_SANS,
                  fontWeight: 600,
                  fontSize: 14.5,
                  cursor: urlValue.trim() ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                {isFetching ? "Fetching…" : "Fetch & Read"}
              </button>
            </div>
            {fetchError && (
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  color: PALETTE.clay,
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                {fetchError}
              </p>
            )}
            <p
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12.5,
                color: PALETTE.inkFaint,
                marginTop: 10,
                lineHeight: 1.5,
              }}
            >
              Some sites block outside requests — if a link won't load, pasting its text
              usually works better.
            </p>
          </div>
        )}

        {/* Upload tab */}
        {tab === "upload" && (
          <div role="tabpanel">
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFile(e.dataTransfer.files && e.dataTransfer.files[0]);
              }}
              role="button"
              tabIndex={0}
              aria-label="Drop a .txt or .md file here, or click to browse"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current && fileInputRef.current.click();
              }}
              style={{
                border: `1.5px dashed ${dragActive ? PALETTE.moss : PALETTE.clay}`,
                borderRadius: 16,
                background: dragActive ? PALETTE.paperSoft : "transparent",
                padding: "40px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "background 250ms ease, border-color 250ms ease",
              }}
            >
              <div style={{ fontSize: 26, color: PALETTE.clay, marginBottom: 10 }}>↥</div>
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 14.5,
                  color: PALETTE.ink,
                  margin: 0,
                }}
              >
                Drop a .txt or .md file here, or tap to browse.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={(e) => handleFile(e.target.files && e.target.files[0])}
                style={{ display: "none" }}
              />
            </div>
            {fileError && (
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 13,
                  color: PALETTE.clay,
                  marginTop: 10,
                }}
              >
                {fileError}
              </p>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button
            onClick={() => onLoad(SAMPLE_TEXT, null)}
            className="cr-no-select"
            style={{
              background: "transparent",
              border: "none",
              fontFamily: FONT_SANS,
              fontSize: 13.5,
              color: PALETTE.mossDeep,
              textDecoration: "underline",
              textDecorationColor: PALETTE.paperDeep,
              cursor: "pointer",
            }}
          >
            or try a sample passage →
          </button>
        </div>
      </div>
    </div>
  );
}
