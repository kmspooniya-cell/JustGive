import en from "../../messages/en.json";
import hi from "../../messages/hi.json";
export type Locale = "en" | "hi";
export type Messages = typeof en;
export function getMessages(locale: Locale): Messages { return (locale === "hi" ? hi : en) as Messages; }
export function isLocale(value: string): value is Locale { return value === "en" || value === "hi"; }
