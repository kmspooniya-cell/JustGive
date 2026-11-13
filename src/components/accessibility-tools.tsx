"use client";
import type { Locale } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";
import { Accessibility, Volume2, VolumeX } from "lucide-react";
import { inlineCopy } from "@/lib/inline-copy";

export function AccessibilityTools({ locale }: { locale: Locale }) {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const nodes = useRef<OscillatorNode[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const prefs = JSON.parse(localStorage.getItem("justgive-a11y") ?? "{}") as { largeText?: boolean; highContrast?: boolean; reducedMotion?: boolean };
        setLargeText(!!prefs.largeText); setHighContrast(!!prefs.highContrast); setReducedMotion(!!prefs.reducedMotion);
      } catch { /* Ignore invalid local preference data. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("a11y-large-text", largeText);
    document.documentElement.classList.toggle("a11y-high-contrast", highContrast);
    document.documentElement.classList.toggle("a11y-reduced-motion", reducedMotion);
    try { localStorage.setItem("justgive-a11y", JSON.stringify({ largeText, highContrast, reducedMotion })); } catch { /* Preferences still apply for this page view. */ }
  }, [largeText, highContrast, reducedMotion]);
  useEffect(() => () => { nodes.current.forEach(node => node.stop()); void audio.current?.close(); }, []);
  async function toggleAudio() {
    if (audioOn) { nodes.current.forEach(node => node.stop()); nodes.current = []; await audio.current?.close(); audio.current = null; setAudioOn(false); return; }
    if (!window.AudioContext) return;
    try {
      const context = new window.AudioContext(); audio.current = context;
      const gain = context.createGain(); gain.gain.value = .012; gain.connect(context.destination);
      [174.61, 220, 261.63].forEach((frequency, index) => { const oscillator = context.createOscillator(); oscillator.type = "sine"; oscillator.frequency.value = frequency; oscillator.detune.value = index * 3 - 3; oscillator.connect(gain); oscillator.start(); nodes.current.push(oscillator); });
      setAudioOn(true);
    } catch { audio.current = null; nodes.current = []; }
  }
  return <div className="accessibility-tools">
    <details className="accessibility-panel"><summary aria-label={inlineCopy(locale, "सुलभता विकल्प", "Accessibility options")}><Accessibility size={19}/><span>{inlineCopy(locale, "सुलभता", "Access")}</span></summary><div className="accessibility-options">
      <label><input type="checkbox" checked={largeText} onChange={event => setLargeText(event.target.checked)}/>{inlineCopy(locale, "बड़ा पाठ", "Larger text")}</label>
      <label><input type="checkbox" checked={highContrast} onChange={event => setHighContrast(event.target.checked)}/>{inlineCopy(locale, "अधिक कंट्रास्ट", "Higher contrast")}</label>
      <label><input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)}/>{inlineCopy(locale, "कम गति", "Reduce motion")}</label>
    </div></details>
    <button className="ambient-audio-button" type="button" onClick={() => void toggleAudio()} aria-pressed={audioOn} aria-label={audioOn ? (inlineCopy(locale, "शांत पृष्ठभूमि ध्वनि बंद करें", "Turn off gentle ambient sound")) : (inlineCopy(locale, "शांत पृष्ठभूमि ध्वनि चालू करें", "Turn on gentle ambient sound"))}>
      {audioOn ? <Volume2 size={18}/> : <VolumeX size={18}/>}<span>{audioOn ? (inlineCopy(locale, "ध्वनि चालू", "Sound on")) : (inlineCopy(locale, "शांत ध्वनि", "Ambient sound"))}</span>
    </button>
  </div>;
}
