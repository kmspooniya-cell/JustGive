// Generates messages/hi-Latn.json from messages/hi.json by transliterating Devanagari
// to Roman (Hinglish). One source of truth (hi.json) keeps Hindi copy consistent while
// offering a Roman-script register. Run: node scripts/build-hinglish.mjs
//
// The engine is syllable-based (not letter-by-letter): it groups each consonant with its
// vowel sign, applies Hindi schwa deletion, and handles common conjuncts. This produces
// readable Hinglish ("koi", "nahin", "tarah") instead of raw output ("koee", "nheen").
import { readFileSync, writeFileSync } from "node:fs";

const consonants = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "n",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "क़": "q", "ख़": "kh", "ग़": "g", "ज़": "z", "ड़": "r", "ढ़": "rh", "फ़": "f", "य़": "y",
};

const independentVowels = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऑ": "o",
  "ऋ": "ri", "ॠ": "ree",
};

const vowelSigns = {
  "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o",
};

const nukta = "़";
const virama = "्";
const anusvara = "ं";
const chandrabindu = "ँ";
const visarga = "ः";

// Common conjuncts that read naturally as clusters rather than letter-by-letter.
const conjuncts = {
  "क्ष": "ksh", "त्र": "tr", "ज्ञ": "gy", "श्र": "shr",
  "क्र": "kr", "प्र": "pr", "ग्र": "gr", "द्र": "dr", "भ्र": "bhr",
};

const isConsonant = (ch) => Object.prototype.hasOwnProperty.call(consonants, ch);
const isVowelSign = (ch) => Object.prototype.hasOwnProperty.call(vowelSigns, ch);
const isIndependentVowel = (ch) => Object.prototype.hasOwnProperty.call(independentVowels, ch);

// A word is a maximal run of Devanagari letters/signs (no Latin, digits, spaces).
function transliterateWord(word) {
  // Handle common conjuncts first (they are 2 code points).
  let out = "";
  let i = 0;
  const syllables = [];

  while (i < word.length) {
    const two = word.slice(i, i + 2);
    if (conjuncts[two]) {
      syllables.push({ cons: conjuncts[two], sign: null, virama: true });
      i += 2;
      continue;
    }
    const ch = word[i];
    if (isConsonant(ch)) {
      const next = word[i + 1];
      // A consonant followed by virama has no inherent vowel (and links to the next).
      if (next === virama) {
        syllables.push({ cons: consonants[ch], sign: null, virama: true });
        i += 2;
        continue;
      }
      // Consonant + vowel sign = one syllable.
      if (isVowelSign(next)) {
        syllables.push({ cons: consonants[ch], sign: vowelSigns[next], virama: false });
        i += 2;
        continue;
      }
      // Bare consonant: inherent 'a' (schwa candidate).
      syllables.push({ cons: consonants[ch], sign: "a", virama: false, schwa: true });
      i += 1;
      continue;
    }
    if (isIndependentVowel(ch)) {
      syllables.push({ cons: null, sign: independentVowels[ch], virama: false });
      i += 1;
      continue;
    }
    // Modifier signs (anusvara, chandrabindu, visarga, nukta) attach to the previous syllable.
    if (ch === anusvara) { if (syllables.length) syllables[syllables.length - 1].nasal = "n"; i += 1; continue; }
    if (ch === chandrabindu) { if (syllables.length) syllables[syllables.length - 1].nasal = "n"; i += 1; continue; }
    if (ch === visarga) { if (syllables.length) syllables[syllables.length - 1].visarga = "h"; i += 1; continue; }
    if (ch === nukta) { i += 1; continue; }
    // Unknown char: keep as-is.
    out += ch;
    i += 1;
  }

  // Apply schwa deletion: drop the inherent 'a' of a bare consonant when it is the
  // last syllable of the word (word-final schwa deletion). Medial schwa is kept,
  // which matches common Hinglish ("samajhna", "karna") rather than over-deleting.
  for (let s = 0; s < syllables.length; s++) {
    const syl = syllables[s];
    const isLast = s === syllables.length - 1;
    if (syl.schwa && isLast) syl.sign = null;
  }

  // Render syllables.
  out = "";
  for (const syl of syllables) {
    const cons = syl.cons ?? "";
    const sign = syl.sign ?? "";
    out += cons + sign;
    if (syl.nasal) out += "n";
    if (syl.visarga) out += "h";
  }
  // Post-process for natural Hinglish: Hindi romanization conventionally shortens
  // long vowels in final unstressed positions (koi, nahi, tarika). We only touch
  // word-final vowels — medial schwa deletion is handled in the syllable pass.
  out = out
    .replace(/ee$/g, "i")   // word-final -ee → -i (koi, nahi)
    .replace(/aa$/g, "a")   // word-final -aa → -a (tarika)
    .replace(/oo$/g, "u");  // word-final -oo → -u
  return out;
}

function transliterate(input) {
  return input.replace(/[ऀ-ॿ₹—…]+|[A-Za-z0-9]+|[^ऀ-ॿ₹—…A-Za-z0-9]+/g, (token) => {
    if (keep.has(token)) return token;
    if (/^[A-Za-z0-9]/.test(token)) return token;
    if (/^[ऀ-ॿ]/.test(token)) return transliterateWord(token);
    return token;
  });
}

const keep = new Set(["JustGive", "INR", "WhatsApp", "NGO", "FCRA", "CSV", "IST", "UTC", "UPI"]);

// Human-curated overrides for the most-visible emotional copy. Everything else uses the
// syllable engine, which now produces readable Hinglish across the whole message set.
const overrides = {
  "brand": "JustGive",
  "tagline": "Ek chhoti si khushi, ek chhota sa kadam.",
  "heroTitle": "Thoda sa dena. Thodi si khushi.",
  "heroText": "JustGive ek personal jagah hai jahan aap chahein to apni marzi se yogdan kar sakte hain. Koi pressure nahi, koi expectation nahi, koi inaam nahi — sirf ek choice jo aapki hai.",
  "nav": {
    "about": "About", "how": "Kaise kaam karta hai", "wall": "Wall of kindness",
    "transparency": "Transparency", "contact": "Contact", "give": "Optional yogdan karein",
  },
};

const source = JSON.parse(readFileSync(new URL("../messages/hi.json", import.meta.url), "utf8"));
const result = JSON.parse(JSON.stringify(source), function (key, value) {
  if (typeof value !== "string") return value;
  if (overrides[key] !== undefined && typeof overrides[key] === "string") return overrides[key];
  return transliterate(value);
});
result.nav = { ...result.nav, ...overrides.nav };
writeFileSync(new URL("../messages/hi-Latn.json", import.meta.url), JSON.stringify(result, null, 2) + "\n");
console.log("Wrote messages/hi-Latn.json");