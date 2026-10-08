import { useState } from "react";
import confetti from "canvas-confetti";
import { sfx, buzz } from "@/lib/audio";

const PAIRS = [["Heads", "Tails"], ["Yes", "No"], ["Buy", "Pass"], ["Option A", "Option B"]];

export function Coin({ onResult }: { onResult: (r: string) => void }) {
  const [labels, setLabels] = useState<string[]>(["Heads", "Tails"]);
  const [deg, setDeg] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [k, setK] = useState(0);

  const flip = () => {
    if (flipping) return;
    const heads = Math.random() < 0.5;
    const base = deg - (deg % 360) + 360 * (5 + Math.floor(Math.random() * 3));
    setDeg(base + (heads ? 0 : 180));
    setFlipping(true); setResult(null); setK((x) => x + 1);
    sfx.clink(); buzz(20);
    setTimeout(() => {
      const r = (heads ? labels[0] : labels[1])!;
      setFlipping(false); setResult(r); onResult(`🪙 ${r}`);
      sfx.clink(); setTimeout(sfx.win, 150); buzz([30, 40, 30]);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 1600);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-wrap justify-center gap-2">
        {PAIRS.map((p) => (
          <button key={p[0]} onClick={() => setLabels(p)} className="chip rounded-full px-3 py-1.5 text-sm font-medium">{p.join(" / ")}</button>
        ))}
      </div>
      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {labels.map((l, i) => (
          <input key={i} value={l} onChange={(e) => setLabels(labels.map((x, j) => (j === i ? e.target.value : x)))}
            className="glass min-w-0 rounded-xl px-3 py-2 text-center font-semibold outline-none focus:ring-2 ring-ring" />
        ))}
      </div>
      <div className="coin-stage mt-36 cursor-pointer" onClick={flip}>
        <div key={k} className={flipping ? "coin-jump" : ""}>
          <div className="coin h-56 w-56" style={{ transform: `rotateY(${deg}deg)`, transition: flipping ? "transform 1.6s cubic-bezier(.2,.7,.3,1)" : "none" }}>
            <div className="coin-face font-display text-3xl font-extrabold break-words">{labels[0]}</div>
            <div className="coin-face coin-back font-display text-3xl font-extrabold break-words">{labels[1]}</div>
          </div>
        </div>
      </div>
      <button onClick={flip} disabled={flipping} className="btn-tactile rounded-2xl px-10 py-4 font-display text-2xl font-extrabold">
        {flipping ? "FLIPPING…" : "FLIP COIN"}
      </button>
      <div className="h-20">
        {result && (
          <div className="glass pop-in rounded-2xl px-8 py-4 text-center">
            <span className="text-sm uppercase tracking-widest text-muted-foreground">It's </span>
            <span className="font-display text-4xl font-extrabold text-primary">{result}</span>
          </div>
        )}
      </div>
    </div>
  );
}
