let ctx: AudioContext | null = null;
export const sound = { enabled: true };

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.15, delay = 0) {
  if (!sound.enabled) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur);
}

export const sfx = {
  tick: () => tone(1800, 0.03, "square", 0.05),
  clink: () => {
    tone(2400, 0.25, "triangle", 0.12);
    tone(3600, 0.18, "sine", 0.08, 0.02);
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, "triangle", 0.12, i * 0.09)),
  roll: () => tone(600 + Math.random() * 400, 0.04, "square", 0.04),
};

export function buzz(ms: number | number[]) {
  if (sound.enabled && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
}
