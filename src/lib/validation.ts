import { z } from "zod";

export const amountSchema = z.number().int().min(100).max(10_000_000);
export const causePreferenceSchema = z.enum(["education", "healthcare", "animalWelfare", "other", "none"]).nullable().optional();
export const paymentOrderSchema = z.object({ amountPaise: amountSchema, causePreference: causePreferenceSchema });
export const messageSchema = z.object({
  message: z.string().trim().max(300).optional().default(""),
  publishConsent: z.boolean().default(false),
  passItOn: z.string().trim().max(140).optional().default(""),
  locale: z.enum(["en", "hi", "hi-Latn"]).default("en"),
  website: z.string().max(0).optional()
});
export const contactSchema = z.object({ name: z.string().trim().min(1).max(100), email: z.string().email().max(254), message: z.string().trim().min(10).max(2000), website: z.string().max(0).optional(), locale: z.enum(["en", "hi", "hi-Latn"]).optional() });
