"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Heart, Sparkles } from "lucide-react";

type Locale = "en" | "hi";

export function OrbitRing({ className, radius, duration }: { className: string; radius: number; duration: string }) {
  return (
    <g className={`heart-orbit ${className}`} style={{ "--orbit-duration": duration } as CSSProperties}>
      <circle className="heart-orbit-line" cx="260" cy="230" r={radius} />
      <circle className="heart-orbit-particle particle-primary" cx="260" cy={230 - radius} r="4" />
      <circle className="heart-orbit-particle particle-secondary" cx={260 + radius} cy="230" r="2.5" />
      <circle className="heart-orbit-particle particle-tertiary" cx="260" cy={230 + radius} r="3" />
    </g>
  );
}

export function FloatingParticle({ className, cx, cy, radius }: { className: string; cx: number; cy: number; radius: number }) {
  return <circle className={`floating-particle ${className}`} cx={cx} cy={cy} r={radius} />;
}

export function AnimatedHeart({ locale }: { locale: Locale }) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const respond = () => setPulse((value) => value + 1);
    window.addEventListener("justgive:amount-change", respond);
    return () => window.removeEventListener("justgive:amount-change", respond);
  }, []);

  const hi = locale === "hi";
  return (
    <div className="hero-art">
      <svg className="hero-illustration orbital-heart" viewBox="0 0 520 460" role="img" aria-labelledby="joy-title joy-description">
        <title id="joy-title">{hi ? "देने की खुशी" : "The joy of giving"}</title>
        <desc id="joy-description">{hi ? "एक धड़कता हुआ दिल और उसके चारों ओर घूमते कण" : "A softly beating heart with glowing particles moving around circular paths"}</desc>
        <defs>
          <radialGradient id="hero-glow"><stop stopColor="#FFE1D8" stopOpacity=".92" /><stop offset=".54" stopColor="#B8F0DF" stopOpacity=".72" /><stop offset="1" stopColor="#E7F8F1" stopOpacity="0" /></radialGradient>
          <linearGradient id="hero-heart" x1="160" y1="130" x2="355" y2="360" gradientUnits="userSpaceOnUse"><stop stopColor="#FFC0B2" /><stop offset=".48" stopColor="#FF8B78" /><stop offset="1" stopColor="#E56C65" /></linearGradient>
          <linearGradient id="hero-heart-highlight" x1="205" y1="154" x2="283" y2="330" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".8" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <filter id="hero-heart-shadow" x="110" y="90" width="300" height="320" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="15" /></filter>
        </defs>
        <ellipse className="heart-ambient-glow" cx="260" cy="230" rx="232" ry="216" fill="url(#hero-glow)" />
        <OrbitRing className="orbit-clockwise" radius={198} duration="44s" />
        <OrbitRing className="orbit-counterclockwise" radius={164} duration="33s" />
        <OrbitRing className="orbit-third" radius={130} duration="62s" />
        <FloatingParticle className="particle-float-a" cx={95} cy={110} radius={3} />
        <FloatingParticle className="particle-float-b" cx={420} cy={132} radius={2.5} />
        <FloatingParticle className="particle-float-c" cx={405} cy={358} radius={3.5} />
        <path d="M260 372c-14-13-122-91-122-178 0-48 34-81 79-81 21 0 37 9 48 29 11-20 27-29 48-29 45 0 79 33 79 81 0 87-108 165-122 178Z" fill="#FF8B78" opacity=".3" filter="url(#hero-heart-shadow)" />
        <g className="heart-stable-core">
          <path key={pulse} className="hero-heart" d="M260 354c-14-13-109-83-109-160 0-43 30-73 70-73 19 0 32 8 39 26 7-18 20-26 39-26 40 0 70 30 70 73 0 77-95 147-109 160Z" fill="url(#hero-heart)" />
          <path d="M260 354c-14-13-109-83-109-160 0-43 30-73 70-73 19 0 32 8 39 26 7-18 20-26 39-26 40 0 70 30 70 73 0 77-95 147-109 160Z" fill="url(#hero-heart-highlight)" opacity=".38" />
          <path className="hero-heart-glint" d="M179 205c6-26 20-40 43-44" />
        </g>
        <path className="hero-star star-a" d="M405 59v18m-9-9h18" />
        <path className="hero-star star-b" d="M102 322v14m-7-7h14" />
        <path className="hero-star star-c" d="M438 272v12m-6-6h12" />
      </svg>
      <div className="hero-floating-note note-top"><Sparkles size={16} aria-hidden="true" /><span>{hi ? "छोटी खुशी" : "A small act, freely chosen"}</span></div>
      <div className="hero-floating-note note-bottom"><Heart size={16} aria-hidden="true" /><span>{hi ? "पूरी तरह वैकल्पिक" : "Always optional"}</span></div>
      <a className="scroll-cue" href="#why"><span>{hi ? "और जानें" : "A little more"}</span><span aria-hidden="true">↓</span></a>
    </div>
  );
}
