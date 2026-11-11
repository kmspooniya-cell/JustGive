/** Advisory text-only cues for a human reviewer. These never publish or reject content. */
export function messageRiskFlags(body: string): string[] {
  const flags: string[] = [];
  if (/https?:\/\/|www\./i.test(body)) flags.push("contains-link");
  if (/(.)\1{7,}/u.test(body)) flags.push("repeated-characters");
  const letters = body.match(/[A-Za-z]/g) ?? [];
  if (letters.length >= 12 && letters.filter(letter => letter === letter.toUpperCase()).length / letters.length > .9) flags.push("mostly-uppercase");
  return flags;
}

export function moderationPageBounds(page: number, pageSize = 20) {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.min(10_000, Math.floor(page))) : 1;
  return { page: safePage, from: (safePage - 1) * pageSize, to: safePage * pageSize };
}
