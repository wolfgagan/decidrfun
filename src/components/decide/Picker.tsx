import { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Shuffle, Users } from "lucide-react";
import { sfx, buzz } from "@/lib/audio";
import { parseList, shuffle, splitTeams } from "@/lib/decide";

type Out = { kind: "pick"; v: string } | { kind: "rank"; v: string[] } | { kind: "teams"; v: string[][] } | null;

export function Picker({ onResult }: { onResult: (r: string) => void }) {
  const [text, setText] = useState("Alex, Sam, Jordan, Riley, Casey, Morgan, Taylor, Jamie");
  const [teams, setTeams] = useState(2);
  const [out, setOut] = useState<Out>(null);
  const [rolling, setRolling] = useState<string | null>(null);
  const items = parseList(text);

  const pick = () => {
    if (items.length < 1 || rolling) return;
    let n = 0;
    const final = items[Math.floor(Math.random() * items.length)]!;
    const go = () => {
      n++;
      if (n < 22) {
        setRolling(items[Math.floor(Math.random() * items.length)]!);
        sfx.roll();
        setTimeout(go, 40 + n * n * 0.6);
      } else {
        setRolling(null); setOut({ kind: "pick", v: final }); onResult(`🎲 ${final}`);
        sfx.win(); buzz([30, 30, 60]);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    };
    go();
  };

  const rank = () => { const r = shuffle(items); setOut({ kind: "rank", v: r }); onResult(`🔀 1st: ${r[0]}`); sfx.clink(); };
  const split = () => { const t = splitTeams(items, teams); setOut({ kind: "teams", v: t }); onResult(`👥 ${t.length} teams made`); sfx.clink(); };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="glass space-y-4 rounded-3xl p-5">
        <h3 className="text-lg font-bold">Your list ({items.length})</h3>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} placeholder="Names separated by commas or new lines"
          className="w-full rounded-xl border border-input bg-background/50 p-3 outline-none focus:ring-2 ring-ring" />
        <button onClick={pick} className="btn-tactile flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold"><Sparkles size={18} /> Pick One</button>
        <button onClick={rank} className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 font-bold text-secondary-foreground"><Shuffle size={18} /> Shuffle & Rank</button>
        <div className="flex gap-2">
          <input type="number" min={2} max={Math.max(2, items.length)} value={teams} onChange={(e) => setTeams(Math.max(1, +e.target.value || 1))}
            className="w-20 shrink-0 rounded-xl border border-input bg-background/50 px-3 text-center font-bold" aria-label="Number of teams" />
          <button onClick={split} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 font-bold text-accent-foreground"><Users size={18} /> Team Splitter</button>
        </div>
      </div>

      <div className="glass grid min-h-80 place-items-center rounded-3xl p-6">
        {rolling ? (
          <p className="font-display text-5xl font-extrabold blur-[1px]">{rolling}</p>
        ) : !out ? (
          <p className="text-muted-foreground">Pick an action to decide ✨</p>
        ) : out.kind === "pick" ? (
          <div className="pop-in text-center">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Chosen one</p>
            <p className="font-display text-6xl font-extrabold text-primary break-words">{out.v}</p>
          </div>
        ) : out.kind === "rank" ? (
          <ol className="w-full max-w-md space-y-2">
            {out.v.map((v, i) => (
              <li key={v + i} className="pop-in flex items-center gap-3 rounded-xl bg-muted px-4 py-2" style={{ animationDelay: `${i * 50}ms` }}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
                <span className="truncate font-semibold">{v}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {out.v.map((t, i) => (
              <div key={i} className="pop-in rounded-2xl bg-muted p-4">
                <h4 className="mb-2 font-display font-bold text-primary">Team {i + 1}</h4>
                <ul className="space-y-1">{t.map((m) => <li key={m} className="truncate">{m}</li>)}</ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
