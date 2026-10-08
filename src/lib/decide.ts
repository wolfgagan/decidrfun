export function parseList(text: string): string[] {
  return text.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
}

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

/** Split into n balanced groups (sizes differ by at most 1). */
export function splitTeams<T>(arr: T[], n: number, rand: () => number = Math.random): T[][] {
  const teams: T[][] = Array.from({ length: Math.max(1, n) }, () => []);
  shuffle(arr, rand).forEach((x, i) => teams[i % teams.length]!.push(x));
  return teams;
}

/** Index of the slice under a pointer at the top (-90deg) given wheel rotation in radians. */
export function sliceAtPointer(rotation: number, count: number): number {
  const slice = (Math.PI * 2) / count;
  const tau = Math.PI * 2;
  const a = (((-Math.PI / 2 - rotation) % tau) + tau) % tau;
  return Math.floor(a / slice) % count;
}
