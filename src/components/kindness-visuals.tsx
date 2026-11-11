"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Flower2, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";

type Locale = "en" | "hi";
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
  const hi = locale === "hi";
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const stars = useMemo(() => pointsFor(count, 360), [count]);
  const [drag, setDrag] = useState<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const changeZoom = (delta: number) => setZoom(value => Math.min(2.25, Math.max(.75, +(value + delta).toFixed(2))));
  return (
    <section className="kindness-universe" aria-labelledby="kindness-universe-title">
      <div className="kindness-universe-copy">
        <span className="eyebrow"><Sparkles size={14} aria-hidden="true" />{hi ? "दयालुता के छोटे पल" : "Small moments of kindness"}</span>
        <h2 id="kindness-universe-title">{hi ? "दयालुता का ब्रह्मांड" : "A universe of kindness"}</h2>
        <p>{hi ? "हर योगदान गुमनाम है। दृश्य केवल सत्यापित सफल योगदानों का कुल योग दिखाता है।" : "Every contribution stays anonymous. This view shows only the total number of verified successful contributions."}</p>
        <p className="kindness-count" aria-live="polite"><strong>{count.toLocaleString(hi ? "hi-IN" : "en-IN")}</strong> {hi ? "सत्यापित योगदान" : "verified contributions"}</p>
        <p className="universe-help" id="universe-help">{hi ? "ज़ूम करने के लिए बटन या स्क्रोल का उपयोग करें। दृश्य खींचकर घुमाएँ।" : "Use the buttons or scroll to zoom. Drag the scene to explore."}</p>
        <div className="universe-controls" role="group" aria-label={hi ? "ब्रह्मांड नियंत्रण" : "Universe controls"}>
          <button type="button" onClick={() => changeZoom(-.25)} aria-label={hi ? "ज़ूम कम करें" : "Zoom out"} disabled={zoom <= .75}><Minus size={16}/></button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => changeZoom(.25)} aria-label={hi ? "ज़ूम बढ़ाएँ" : "Zoom in"} disabled={zoom >= 2.25}><Plus size={16}/></button>
          <button type="button" onClick={() => setOffset(v => ({ ...v, x: v.x - 18 }))} aria-label={hi ? "बाएँ पैन करें" : "Pan left"}><ArrowLeft size={15}/></button>
          <button type="button" onClick={() => setOffset(v => ({ ...v, y: v.y - 18 }))} aria-label={hi ? "ऊपर पैन करें" : "Pan up"}><ArrowUp size={15}/></button>
          <button type="button" onClick={() => setOffset(v => ({ ...v, y: v.y + 18 }))} aria-label={hi ? "नीचे पैन करें" : "Pan down"}><ArrowDown size={15}/></button>
          <button type="button" onClick={() => setOffset(v => ({ ...v, x: v.x + 18 }))} aria-label={hi ? "दाएँ पैन करें" : "Pan right"}><ArrowRight size={15}/></button>
          <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label={hi ? "दृश्य रीसेट करें" : "Reset view"}><RotateCcw size={15}/></button>
        </div>
      </div>
      <div className="kindness-orbit" aria-describedby="universe-help" role="img" aria-label={count ? (hi ? `${count} सत्यापित योगदानों का गुमनाम दृश्य` : `Anonymous visualization of ${count} verified contributions`) : (hi ? "सत्यापित योगदान आने पर ब्रह्मांड दिखेगा" : "The kindness universe will appear when verified contributions are available")}
        onWheel={event => { event.preventDefault(); changeZoom(event.deltaY < 0 ? .1 : -.1); }}
        onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setDrag({ x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y }); }}
        onPointerMove={event => { if (drag) setOffset({ x: drag.ox + (event.clientX - drag.x) / 4, y: drag.oy + (event.clientY - drag.y) / 4 }); }}
        onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
        <div className="kindness-orbit-scene" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
          <div className="kindness-orbit-ring" /><div className="kindness-orbit-core"><Flower2 aria-hidden="true" /></div>
          {stars.map((star, index) => <span key={index} className="kindness-star" style={{ left: `${star.x}%`, top: `${star.y}%`, animationDelay: star.delay }} />)}
        </div>
        {!count && <span className="kindness-empty-label">{hi ? "पहली रोशनी का इंतज़ार है" : "Waiting for the first light"}</span>}
        {count > 360 && <span className="kindness-empty-label">{hi ? "प्रतीकात्मक दृश्य · कुल संख्या सटीक" : "Symbolic view · exact total shown"}</span>}
      </div>
    </section>
  );
}

export function KindnessTree({ count, locale }: { count: number; locale: Locale }) {
  const hi = locale === "hi";
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const leaves = Array.from({ length: Math.min(Math.max(0, Math.floor(count)), 240) }, (_, i) => {
    const angle = i * 2.399963;
    const radius = 7 + Math.sqrt(i + 1) * 5.2;
    return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius * .62 };
  });
  return (
    <section className="kindness-tree glass-panel" aria-labelledby="kindness-tree-title">
      <div><span className="eyebrow">{hi ? "प्रतीकात्मक दृश्य" : "A symbolic view"}</span><h2 id="kindness-tree-title">{hi ? "दयालुता का पेड़" : "The kindness tree"}</h2><p>{hi ? "पेड़ का दृश्य कुल सत्यापित योगदान के साथ बढ़ता है। यह पर्यावरणीय दान का संकेत नहीं है।" : "The tree grows with the verified contribution total. This does not represent environmental giving."}</p><strong>{count.toLocaleString(hi ? "hi-IN" : "en-IN")} {hi ? "योगदान" : "contributions"}</strong>
        <div className="tree-controls" role="group" aria-label={hi ? "पेड़ नियंत्रण" : "Tree controls"}><button type="button" onClick={() => setZoom(v => Math.min(1.8, v + .2))} aria-label={hi ? "पेड़ बड़ा करें" : "Zoom in on tree"}><Plus size={16}/></button><button type="button" onClick={() => setZoom(v => Math.max(.8, v - .2))} aria-label={hi ? "पेड़ छोटा करें" : "Zoom out on tree"}><Minus size={16}/></button><button type="button" onClick={() => setOffset(v => ({...v,x:v.x-12}))} aria-label={hi ? "पेड़ बाएँ करें" : "Pan tree left"}><ArrowLeft size={15}/></button><button type="button" onClick={() => setOffset(v => ({...v,y:v.y-12}))} aria-label={hi ? "पेड़ ऊपर करें" : "Pan tree up"}><ArrowUp size={15}/></button><button type="button" onClick={() => setOffset(v => ({...v,y:v.y+12}))} aria-label={hi ? "पेड़ नीचे करें" : "Pan tree down"}><ArrowDown size={15}/></button><button type="button" onClick={() => setOffset(v => ({...v,x:v.x+12}))} aria-label={hi ? "पेड़ दाएँ करें" : "Pan tree right"}><ArrowRight size={15}/></button><button type="button" onClick={() => {setZoom(1);setOffset({x:0,y:0})}} aria-label={hi ? "पेड़ रीसेट करें" : "Reset tree"}><RotateCcw size={15}/></button></div>
      </div>
      <svg className="kindness-tree-art" viewBox="0 0 220 190" role="img" aria-label={hi ? `${count} सत्यापित योगदान का प्रतीकात्मक पेड़` : `A symbolic tree representing ${count} verified contributions`} onWheel={event => setOffset(value => ({...value,y:value.y-Math.sign(event.deltaY)*4}))} onPointerDown={event => {event.currentTarget.setPointerCapture(event.pointerId);drag.current={x:event.clientX,y:event.clientY,ox:offset.x,oy:offset.y}}} onPointerMove={event => {if(drag.current)setOffset({x:drag.current.ox+(event.clientX-drag.current.x),y:drag.current.oy+(event.clientY-drag.current.y)})}} onPointerUp={() => {drag.current=null}} onPointerCancel={() => {drag.current=null}}>
        <g transform={`translate(110 95) translate(${offset.x} ${offset.y}) scale(${zoom}) translate(-110 -95)`}>
          <path d="M109 166c4-28 1-53-4-75m4 57c-16-14-25-22-37-29m39 10c11-13 22-21 35-26m-39 4c-9-11-17-17-27-21m32 12c8-10 14-15 23-19" fill="none" stroke="#8A6D4E" strokeWidth="7" strokeLinecap="round" />
          {leaves.length ? leaves.map((leaf, i) => { const x=109+(leaf.x-50)*.9, y=78+(leaf.y-50)*.63; return <ellipse key={i} cx={x} cy={y} rx="7" ry="4" transform={`rotate(${(i*31)%180} ${x} ${y})`} fill={i%4===0?"#FF8B78":"#55B89C"} className="tree-leaf" style={{ animationDelay: `${(i%20)*-.11}s` }} />; }) : <path d="M109 37c-22 8-33 25-31 42 13 4 27-2 34-14 10 13 27 16 41 9 0-18-17-35-44-37Z" fill="#B8F0DF" />}
        </g>
      </svg>
      {count > 240 && <p className="tree-cap-note">{hi ? "पेड़ का दृश्य प्रतीकात्मक है; कुल संख्या सटीक है।" : "The tree is symbolic; the total remains exact."}</p>}
    </section>
  );
}
