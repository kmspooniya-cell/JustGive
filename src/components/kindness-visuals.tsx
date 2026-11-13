"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Flower2, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";

import type { Locale } from "@/lib/i18n";
import { inlineCopy } from "@/lib/inline-copy";
function pointsFor(count: number, limit: number) {
  const shown = Math.min(Math.max(0, Math.floor(count)), limit);
  return Array.from({ length: shown }, (_, index) => {
    const angle = index * 2.399963;
    const radius = 7 + Math.sqrt(index + 1) * 7;
    return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius * 0.68, delay: `${(index % 9) * -0.23}s` };
  });
}

/** Interactive, anonymous aggregate visualization. The exact count is always stated separately. */
export function KindnessVisuals({ count, locale }: { count: number; locale: Locale }) {
  const hi = locale !== "en";
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const stars = useMemo(() => pointsFor(count, 360), [count]);
  const [drag, setDrag] = useState<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const changeZoom = (delta: number) => setZoom(value => Math.min(2.25, Math.max(.75, +(value + delta).toFixed(2))));
  return (
    <section className="kindness-universe" aria-labelledby="kindness-universe-title">
      <div className="kindness-universe-copy">
        <span className="eyebrow"><Sparkles size={14} aria-hidden="true" />{inlineCopy(locale, "दयालुता के छोटे पल", "Small moments of kindness")}</span>
        <h2 id="kindness-universe-title">{inlineCopy(locale, "दयालुता का ब्रह्मांड", "A universe of kindness")}</h2>
        <p>{inlineCopy(locale, "हर योगदान गुमनाम है। दृश्य केवल सत्यापित सफल योगदानों का कुल योग दिखाता है।", "Every contribution stays anonymous. This view shows only the total number of verified successful contributions.")}</p>
        <p className="kindness-count" aria-live="polite"><strong>{count.toLocaleString(hi ? "hi-IN" : "en-IN")}</strong> {inlineCopy(locale, "सत्यापित योगदान", "verified contributions")}</p>
        <p className="universe-help" id="universe-help">{inlineCopy(locale, "ज़ूम करने के लिए बटन या स्क्रोल का उपयोग करें। दृश्य खींचकर घुमाएँ।", "Use the buttons or scroll to zoom. Drag the scene to explore.")}</p>
        <div className="universe-controls" role="group" aria-label={inlineCopy(locale, "ब्रह्मांड नियंत्रण", "Universe controls")}>
          <button type="button" onClick={() => changeZoom(-.25)} aria-label={inlineCopy(locale, "ज़ूम कम करें", "Zoom out")} disabled={zoom <= .75}><Minus size={16}/></button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => changeZoom(.25)} aria-label={inlineCopy(locale, "ज़ूम बढ़ाएँ", "Zoom in")} disabled={zoom >= 2.25}><Plus size={16}/></button>
          <button type="button" onClick={() => setOffset(v => ({ ...v, x: v.x - 18 }))} aria-label={inlineCopy(locale, "बाएँ पैन करें", "Pan left")}><ArrowLeft size={15}/></button>
          <button type="button" onClick={() => setOffset(v => ({ ...v, y: v.y - 18 }))} aria-label={inlineCopy(locale, "ऊपर पैन करें", "Pan up")}><ArrowUp size={15}/></button>
          <button type="button" onClick={() => setOffset(v => ({ ...v, y: v.y + 18 }))} aria-label={inlineCopy(locale, "नीचे पैन करें", "Pan down")}><ArrowDown size={15}/></button>
          <button type="button" onClick={() => setOffset(v => ({ ...v, x: v.x + 18 }))} aria-label={inlineCopy(locale, "दाएँ पैन करें", "Pan right")}><ArrowRight size={15}/></button>
          <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label={inlineCopy(locale, "दृश्य रीसेट करें", "Reset view")}><RotateCcw size={15}/></button>
        </div>
      </div>
      <div className="kindness-orbit" aria-describedby="universe-help" role="img" aria-label={count ? (inlineCopy(locale, `${count} सत्यापित योगदानों का गुमनाम दृश्य`, `Anonymous visualization of ${count} verified contributions`)) : (inlineCopy(locale, "सत्यापित योगदान आने पर ब्रह्मांड दिखेगा", "The kindness universe will appear when verified contributions are available"))}
        onWheel={event => { event.preventDefault(); changeZoom(event.deltaY < 0 ? .1 : -.1); }}
        onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setDrag({ x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y }); }}
        onPointerMove={event => { if (drag) setOffset({ x: drag.ox + (event.clientX - drag.x) / 4, y: drag.oy + (event.clientY - drag.y) / 4 }); }}
        onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
        <div className="kindness-orbit-scene" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
          <div className="kindness-orbit-ring" /><div className="kindness-orbit-core"><Flower2 aria-hidden="true" /></div>
          {stars.map((star, index) => <span key={index} className="kindness-star" style={{ left: `${star.x}%`, top: `${star.y}%`, animationDelay: star.delay }} />)}
        </div>
        {!count && <span className="kindness-empty-label">{inlineCopy(locale, "पहली रोशनी का इंतज़ार है", "Waiting for the first light")}</span>}
        {count > 360 && <span className="kindness-empty-label">{inlineCopy(locale, "प्रतीकात्मक दृश्य · कुल संख्या सटीक", "Symbolic view · exact total shown")}</span>}
      </div>
    </section>
  );
}

