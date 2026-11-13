"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Heart, Send, Sparkles, BookOpen, Stethoscope, PawPrint, HandHeart, CircleOff, HeartHandshake, ChevronDown, X } from "lucide-react";
import { getMessages, type Locale } from "@/lib/i18n";
import { GlassButton, GlassInput, GlassPanel } from "@/components/glass-surfaces";

const presets = [1, 5, 10, 21, 51, 101];
const causes = ["education", "healthcare", "animalWelfare", "other", "none"] as const;
const causeIcons = { education: BookOpen, healthcare: Stethoscope, animalWelfare: PawPrint, other: HandHeart, none: CircleOff };

export function ContributionForm({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const [amount, setAmount] = useState<number | null>(null);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [visualPulse, setVisualPulse] = useState(0);
  const [note, setNote] = useState("");
  const [noteConsent, setNoteConsent] = useState(false);
  const [noteBusy, setNoteBusy] = useState(false);
  const [noteState, setNoteState] = useState<"idle" | "sent" | "error">("idle");
  const [cause, setCause] = useState<(typeof causes)[number] | null>(null);
  const [causeOpen, setCauseOpen] = useState(false);
  const causeDialog = useRef<HTMLDialogElement>(null);
  const causeTrigger = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const selectedAmount = raw ? Number(raw) : amount;

  useEffect(() => {
    const dialog = causeDialog.current;
    const trigger = causeTrigger.current;
    if (!causeOpen || !dialog) return;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>(".cause-dialog-close")?.focus();
    return () => {
      dialog.close();
      trigger?.focus();
    };
  }, [causeOpen]);

  function changeAmount(value: number) {
    setAmount(value);
    setRaw("");
    setError("");
    setVisualPulse((pulse) => pulse + 1);
    window.dispatchEvent(new Event("justgive:amount-change"));
  }

  function changeCustomAmount(value: string) {
    setRaw(value);
    setError("");
    setVisualPulse((pulse) => pulse + 1);
    window.dispatchEvent(new Event("justgive:amount-change"));
  }

  async function submitContribution() {
    const value = raw ? Number(raw) : amount;
    if (value === null || !Number.isInteger(value) || value < 1 || value > 100000) {
      setError(t.amountInvalid);
      return;
    }

    setAmount(value);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaise: value * 100, locale, causePreference: cause }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t.notConfigured);
      router.push(`/${locale}/checkout?order=${encodeURIComponent(result.orderId)}&amount=${value}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.notConfigured);
      setBusy(false);
    }
  }

  async function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note.trim() || !noteConsent || noteBusy) return;

    setNoteBusy(true);
    setNoteState("idle");
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: note, publishConsent: true, locale }),
      });
      if (!response.ok) throw new Error("Message submission failed");
      setNote("");
      setNoteConsent(false);
      setNoteState("sent");
    } catch {
      setNoteState("error");
    } finally {
      setNoteBusy(false);
    }
  }

  return (
    <GlassPanel className="give-card" id="give" aria-labelledby="give-title">
      <div className="give-card-header">
        <div className="give-heading">
          <h2 id="give-title">{t.formHeading}</h2>
          <p>{t.formIntro}</p>
        </div>
        <div key={visualPulse} className="contribution-visual" aria-hidden="true">
          <svg viewBox="0 0 88 88" role="presentation">
            <defs>
              <linearGradient id="joy-heart" x1="14" y1="10" x2="73" y2="78" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFE1D8" />
                <stop offset="1" stopColor="#FF8B78" />
              </linearGradient>
            </defs>
            <path className="joy-heart-shadow" d="M44 76C37 68 12 51 12 31c0-11 8-19 19-19 6 0 11 3 14 9 3-6 8-9 14-9 11 0 19 8 19 19 0 20-25 37-34 45Z" />
            <path className="joy-heart-shape" d="M44 72C37 64 16 49 16 32c0-9 6-15 15-15 6 0 10 4 13 10 3-6 7-10 13-10 9 0 15 6 15 15 0 17-21 32-28 40Z" fill="url(#joy-heart)" />
            <path className="joy-heart-glint" d="M27 29c1-4 4-7 8-8" />
            <path className="joy-ray joy-ray-one" d="M11 20l-5-3" />
            <path className="joy-ray joy-ray-two" d="M76 26l5-3" />
            <path className="joy-ray joy-ray-three" d="M72 63l5 3" />
            <circle className="joy-particle joy-particle-one" cx="18" cy="51" r="2.4" />
            <circle className="joy-particle joy-particle-two" cx="70" cy="45" r="1.8" />
          </svg>
          <Sparkles className="visual-sparkle" size={15} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {t.selectedAmount.replace("{amount}", selectedAmount === null ? t.amountNotSelected : `₹${selectedAmount}`)}
      </p>
      <div className="amount-grid" role="group" aria-label={t.choose}>
        {presets.map((value) => (
          <button
            type="button"
            key={value}
            className={`amount-button ${!raw && amount === value ? "selected" : ""}`}
            aria-pressed={!raw && amount === value}
            onClick={() => changeAmount(value)}
          >
            <span>₹{value}</span>
            {!raw && amount === value && <Check size={14} aria-hidden="true" />}
          </button>
        ))}
      </div>

      <label className="custom-amount">
        <span>{t.custom}</span>
        <div>
          <span aria-hidden="true">₹</span>
          <GlassInput
            inputMode="numeric"
            type="number"
            min="1"
            max="100000"
            step="1"
            value={raw}
            onChange={(event) => changeCustomAmount(event.target.value)}
            placeholder="21"
            aria-label={t.custom}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "amount-error" : undefined}
          />
          <small>INR</small>
        </div>
      </label>

      <div className="cause-trigger-row">
        <button ref={causeTrigger} type="button" className="cause-trigger" aria-haspopup="dialog" aria-expanded={causeOpen} aria-describedby="cause-optional-label" onClick={() => setCauseOpen(true)}>
          <HeartHandshake size={17} aria-hidden="true" />
          <span>{cause ? t.causes[cause] : t.causeTrigger}</span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
        <span id="cause-optional-label" className="cause-optional">{t.optionalLabel}</span>
      </div>

      {causeOpen && <dialog ref={causeDialog} className="cause-dialog" aria-labelledby="cause-dialog-title" onCancel={(event) => { event.preventDefault(); setCauseOpen(false); }} onClick={(event) => { if (event.target === event.currentTarget) setCauseOpen(false); }}>
        <div className="cause-dialog-heading">
          <div><h2 id="cause-dialog-title">{t.causeModalTitle}</h2><p>{t.causeSubtitle}</p></div>
          <button type="button" className="cause-dialog-close" aria-label={t.causeClose} onClick={() => setCauseOpen(false)}><X size={19} aria-hidden="true" /></button>
        </div>
        <div className="cause-dialog-options" role="group" aria-label={t.causeModalTitle}>
          {causes.map((value) => {
            const Icon = causeIcons[value];
            return <button type="button" key={value} aria-pressed={cause === value} className="cause-option" onClick={() => setCause(current => current === value ? null : value)}>
              <Icon size={19} aria-hidden="true" /><span>{t.causes[value]}</span>{cause === value && <Check size={15} aria-hidden="true" />}
            </button>;
          })}
        </div>
        <div className="cause-dialog-actions">
          {cause && <button type="button" className="button-secondary cause-clear" onClick={() => setCause(null)}>{t.causeClear}</button>}
          <button type="button" className="button cause-done" onClick={() => setCauseOpen(false)}>{t.causeDone}</button>
        </div>
      </dialog>}

      <p className="recipient-note">{t.recipient}</p>
      <p className="recipient-note">{t.checkoutCauseDisclosure}</p>

      <GlassButton className="button give-submit" type="button" disabled={busy || selectedAmount === null} onClick={submitContribution}>
        {busy
          ? t.working
          : selectedAmount === null ? t.chooseAmount : t.continue.replace("{amount}", String(Number.isFinite(selectedAmount) ? selectedAmount : 0))}
        <ArrowUpRight size={18} aria-hidden="true" />
      </GlassButton>
      {error && <p id="amount-error" className="form-error" role="alert">{error}</p>}
      <div className="demo-disclosures">
        <p className="demo-note"><span className="demo-dot" aria-hidden="true" />{t.demo}</p>
        <p className="tiny-note">{t.voluntary}</p>
      </div>

      <details className="optional-note">
        <summary><Heart size={16} aria-hidden="true" />{t.leaveNote}</summary>
        <p>{t.noteDisclosure}</p>
        <form onSubmit={submitNote}>
          <label htmlFor="contribution-note">{t.messageLabel}</label>
          <textarea
            id="contribution-note"
            value={note}
            maxLength={300}
            rows={3}
            onChange={(event) => { setNote(event.target.value); setNoteState("idle"); }}
            aria-describedby="contribution-note-count"
          />
          <div className="note-form-meta">
            <span id="contribution-note-count">{note.length}/300</span>
            <label className="note-consent">
              <input type="checkbox" checked={noteConsent} onChange={(event) => setNoteConsent(event.target.checked)} />
              <span>{t.consentLabel}</span>
            </label>
          </div>
          <button className="button button-secondary note-submit" type="submit" disabled={!note.trim() || !noteConsent || noteBusy}>
            {noteBusy ? t.noteSending : t.noteSend}<Send size={15} aria-hidden="true" />
          </button>
          {noteState === "sent" && <p className="note-feedback" role="status">{t.noteSubmitted}</p>}
          {noteState === "error" && <p className="form-error" role="alert">{t.noteError}</p>}
        </form>
      </details>
    </GlassPanel>
  );
}
