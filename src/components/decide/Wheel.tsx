import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { X, Plus, RotateCw, Share2, Trash2 } from "lucide-react";
import { sfx, buzz } from "@/lib/audio";
import { sliceAtPointer } from "@/lib/decide";

const PRESETS: Record<string, string[]> = {
  "Where to Eat?": ["Pizza", "Sushi", "Tacos", "Burgers", "Curry", "Salad"],
  "Who Goes First?": ["Player 1", "Player 2", "Player 3", "Player 4"],
  "Movie Night Genre": ["Comedy", "Horror", "Sci-Fi", "Romance", "Action", "Animation", "Thriller"],
  "Truth or Dare": ["Truth", "Dare", "Truth", "Dare", "Double Dare", "Free Pass"],
};
const HUES = [25, 190, 85, 145, 330, 230, 55, 165];

export function Wheel({ onResult }: { onResult: (r: string) => void }) {
  const [options, setOptions] = useState(PRESETS["Where to Eat?"]);
  const [input, setInput] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const rot = useRef(-Math.PI / 2);
  const canvas = useRef<HTMLCanvasElement>(null);

  const draw = () => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const s = c.width, r = s / 2;
    ctx.clearRect(0, 0, s, s);
    const n = Math.max(options.length, 1);
    const sl = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const a0 = rot.current + i * sl;
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r - 6, a0, a0 + sl);
      ctx.fillStyle = `oklch(0.72 0.16 ${HUES[i % HUES.length]})`;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(a0 + sl / 2);
      ctx.fillStyle = "#1c1f2e";
      ctx.font = `700 ${Math.max(14, 30 - n)}px "DM Sans", sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const label = options[i] ?? "";
      ctx.fillText(label.length > 14 ? label.slice(0, 13) + "…" : label, r - 24, 0);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(r, r, 30, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  };

  useEffect(draw, [options]);

  const spin = () => {
    if (spinning || options.length < 2) return;
    setSpinning(true);
    const start = rot.current;
    const total = Math.PI * 2 * (5 + Math.random() * 4) + Math.random() * Math.PI * 2;
    const dur = 4500 + Math.random() * 1500;
    const t0 = performance.now();
    let last = sliceAtPointer(start, options.length);
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      rot.current = start + total * e;
      const cur = sliceAtPointer(rot.current, options.length);
      if (cur !== last) { last = cur; sfx.tick(); buzz(5); }
      draw();
      if (p < 1) requestAnimationFrame(step);
      else {
        const w = options[cur];
        setSpinning(false);
        setWinner(w);
        onResult(`🎡 ${w}`);
        sfx.win(); buzz([40, 30, 80]);
        confetti({ particleCount: 160, spread: 90, origin: { y: 0.55 } });
      }
    };
    requestAnimationFrame(step);
  };

  const add = () => {
    const v = input.trim();
    if (v) setOptions([...options, v]);
    setInput("");
  };

  const share = async () => {
    const text = `The wheel decided: ${winner}!`;
    if (navigator.share) await navigator.share({ text }).catch(() => {});
    else await navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-full max-w-[460px]">
          <div className="absolute left-1/2 -top-2 z-10 -translate-x-1/2 h-0 w-0 border-x-[16px] border-t-[28px] border-x-transparent border-t-foreground drop-shadow" />
          <canvas ref={canvas} width={600} height={600} onClick={spin}
            className="w-full aspect-square rounded-full glass p-1 cursor-pointer" />
        </div>
        <button onClick={spin} disabled={spinning || options.length < 2}
          className="btn-tactile rounded-2xl px-12 py-4 font-display text-2xl font-extrabold tracking-wide">
          {spinning ? "SPINNING…" : "SPIN"}
        </button>
      </div>

      <div className="glass rounded-3xl p-5 space-y-4">
        <h3 className="text-lg font-bold">Options ({options.length})</h3>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add an option" className="min-w-0 flex-1 rounded-xl border border-input bg-background/50 px-3 py-2 outline-none focus:ring-2 ring-ring" />
          <button onClick={add} aria-label="Add" className="shrink-0 rounded-xl bg-secondary px-3 text-secondary-foreground"><Plus size={18} /></button>
        </div>
        <div className="flex max-h-56 flex-wrap gap-2 overflow-auto">
          {options.map((o, i) => (
            <span key={i} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
              <input value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))}
                className="bg-transparent outline-none" style={{ width: `${Math.max(o.length, 2) + 1}ch` }} />
              <button aria-label={`Remove ${o}`} onClick={() => setOptions(options.filter((_, j) => j !== i))}><X size={14} /></button>
            </span>
          ))}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Presets</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((k) => (
              <button key={k} onClick={() => setOptions(PRESETS[k])} className="chip rounded-full px-3 py-1.5 text-sm font-medium">{k}</button>
            ))}
          </div>
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 p-4 backdrop-blur-sm" onClick={() => setWinner(null)}>
          <div className="glass pop-in w-full max-w-sm rounded-3xl p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">The winner is</p>
            <h2 className="my-4 break-words text-5xl font-extrabold text-primary">{winner}</h2>
            <div className="grid gap-2">
              <button className="btn-tactile flex items-center justify-center gap-2 rounded-xl py-3 font-bold"
                onClick={() => { const w = winner; setWinner(null); setOptions((o) => { const i = o.indexOf(w); return o.filter((_, j) => j !== i); }); }}>
                <Trash2 size={18} /> Remove Winner & Spin Again
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-secondary py-3 font-bold text-secondary-foreground"
                onClick={() => { setWinner(null); setTimeout(spin, 100); }}><RotateCw size={18} /> Spin Again</button>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-muted py-3 font-bold" onClick={share}><Share2 size={18} /> Share Result</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
