// Runtime Devanagari -> Roman (Hinglish) transliterator.
//
// This mirrors scripts/build-hinglish.mjs (which generates messages/hi-Latn.json) so
// inline copy in components can be rendered in the same register without adding a
// catalog key for every string. The engine is syllable-based: it groups each consonant
// with its vowel sign, applies Hindi schwa deletion, and handles common conjuncts.
const consonants: Record<string, string> = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "n",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "क़": "q", "ख़": "kh", "ग़": "g", "ज़": "z", "ड़": "r", "ढ़": "rh", "फ़": "f", "य़": "y",
};

const independentVowels: Record<string, string> = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऑ": "o",
  "ऋ": "ri", "ॠ": "ree",
};

const vowelSigns: Record<string, string> = {
  "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o",
};

const conjuncts: Record<string, string> = {
  "क्ष": "ksh", "त्र": "tr", "ज्ञ": "gy", "श्र": "shr",
  "क्र": "kr", "प्र": "pr", "ग्र": "gr", "द्र": "dr", "भ्र": "bhr",
};

const virama = "्";
const anusvara = "ं";
const chandrabindu = "ँ";
const visarga = "ः";
const nukta = "़";

// English loanwords that read naturally in Latin script in Hinglish. Keyed by the exact
// Devanagari word so we never touch unrelated text.
const wordOverrides: Record<string, string> = {
  "ईमेल": "Email",
  "रिफंड": "refund",
  "चैरिटी": "charity",
  "एंट्री": "entry",
  "जर्नल": "journal",
  "सिमुलेशन": "simulation",
  "सिम्युलेटेड": "simulated",
  "लिंक": "link",
  "बैंक": "bank",
  "बैंकों": "banks",
  "कार्ड": "card",
  "कंट्रास्ट": "contrast",
  "मूड": "mood",
  "ट्रैकिंग": "tracking",
  "डिवाइस": "device",
  "पासवर्ड": "password",
};

const isConsonant = (ch: string) => Object.prototype.hasOwnProperty.call(consonants, ch);
const isVowelSign = (ch: string) => Object.prototype.hasOwnProperty.call(vowelSigns, ch);
const isIndependentVowel = (ch: string) => Object.prototype.hasOwnProperty.call(independentVowels, ch);

interface Syllable {
  cons: string | null;
  sign: string | null;
  schwa?: boolean;
  nasal?: boolean;
  visarga?: boolean;
}

function transliterateWord(word: string): string {
  // Whole-word loanword override (optionally followed by Devanagari punctuation).
  const exact = wordOverrides[word];
  if (exact) return exact;
  const trailing = word.match(/^([\u0900-\u097F]+)([^\u0900-\u097F]+)$/);
  if (trailing && wordOverrides[trailing[1]]) return wordOverrides[trailing[1]] + trailing[2];

  let i = 0;
  const syllables: Syllable[] = [];
  while (i < word.length) {
    const two = word.slice(i, i + 2);
    if (conjuncts[two]) {
      syllables.push({ cons: conjuncts[two], sign: null });
      i += 2;
      continue;
    }
    const ch = word[i];
    if (isConsonant(ch)) {
      const next = word[i + 1];
      if (next === virama) {
        syllables.push({ cons: consonants[ch], sign: null });
        i += 2;
        continue;
      }
      if (isVowelSign(next)) {
        syllables.push({ cons: consonants[ch], sign: vowelSigns[next] });
        i += 2;
        continue;
      }
      syllables.push({ cons: consonants[ch], sign: "a", schwa: true });
      i += 1;
      continue;
    }
    if (isIndependentVowel(ch)) {
      syllables.push({ cons: null, sign: independentVowels[ch] });
      i += 1;
      continue;
    }
    // A vowel sign that arrives without a preceding consonant (e.g. after a skipped
    // nukta) attaches to the previous syllable so it isn't rendered as a stray mark.
    if (isVowelSign(ch)) {
      const last = syllables[syllables.length - 1];
      if (last) {
        last.sign = vowelSigns[ch];
        last.schwa = false;
      } else {
        syllables.push({ cons: null, sign: vowelSigns[ch] });
      }
      i += 1;
      continue;
    }
    if (ch === anusvara || ch === chandrabindu) {
      if (syllables.length) syllables[syllables.length - 1].nasal = true;
      i += 1;
      continue;
    }
    if (ch === visarga) {
      if (syllables.length) syllables[syllables.length - 1].visarga = true;
      i += 1;
      continue;
    }
    if (ch === nukta) {
      i += 1;
      continue;
    }
    // Unknown character: Devanagari punctuation (danda etc.) becomes a period,
    // anything else is kept verbatim.
    i += 1;
    syllables.push({ cons: null, sign: ch === "।" || ch === "॥" ? "." : word[i - 1] });
  }

  // Word-final schwa deletion.
  for (let s = 0; s < syllables.length; s++) {
    const syl = syllables[s];
    if (syl.schwa && s === syllables.length - 1) syl.sign = null;
  }

  let out = "";
  for (const syl of syllables) {
    out += (syl.cons ?? "") + (syl.sign ?? "");
    if (syl.nasal) out += "n";
    if (syl.visarga) out += "h";
  }

  // Shorten long vowels in word-final unstressed positions (koi, nahi, tarika).
  return out
    .replace(/ee$/g, "i")
    .replace(/aa$/g, "a")
    .replace(/oo$/g, "u");
}

export function transliterateDevanagari(input: string): string {
  return input.replace(/[\u0900-\u097F₹—…]+|[A-Za-z0-9]+|[^ऀ-ॿ₹—…A-Za-z0-9]+/g, (token) => {
    if (/^[A-Za-z0-9]/.test(token)) return token;
    if (/^[\u0900-\u097F]/.test(token)) return transliterateWord(token);
    return token;
  });
}