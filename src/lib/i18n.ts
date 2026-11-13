import en from "../../messages/en.json";
import hi from "../../messages/hi.json";
import hiLatn from "../../messages/hi-Latn.json";
export type Locale = "en" | "hi" | "hi-Latn";
export type Messages = typeof en;
const byLocale = { en, hi, "hi-Latn": hiLatn } as const;
export function getMessages(locale: Locale): Messages { return byLocale[locale] as Messages; }
export function isLocale(value: string): value is Locale { return value === "en" || value === "hi" || value === "hi-Latn"; }
export function isDevanagari(value: string): boolean { return /[\u0900-\u097F]/.test(value); }
export function dirFor(): "ltr" { return "ltr"; }
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;