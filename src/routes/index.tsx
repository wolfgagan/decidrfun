import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History, Moon, Sun, Volume2, VolumeX, X } from "lucide-react";
import { Wheel } from "@/components/decide/Wheel";
import { Coin } from "@/components/decide/Coin";
import { Picker } from "@/components/decide/Picker";
import { sound } from "@/lib/audio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Decidr — Spin, Flip & Pick" },
      { name: "description", content: "Can't decide? Spin a wheel, flip a coin, or pick from a list, with sound and confetti." },
      { property: "og:title", content: "Decidr — Spin, Flip & Pick" },
      { property: "og:description", content: "A playful random decision maker: wheel, coin toss and quick picker." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "wheel", label: "Spin the Wheel", emoji: "🎡" },
  { id: "coin", label: "Coin Flip", emoji: "🪙" },
  { id: "pick", label: "Quick Picker", emoji: "🎲" },
] as const;

function Index() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("wheel");
  const [muted, setMuted] = useState(false);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<{ r: string; t: string }[]>([]);

  useEffect(() => { sound.enabled = !muted; }, [muted]);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  const log = (r: string) => setHistory((h) => [{ r, t: new Date().toLocaleTimeString() }, ...h].slice(0, 50));

  const iconBtn = "glass grid h-11 w-11 shrink-0 place-items-center rounded-xl transition hover:scale-105";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h1 className="truncate text-3xl font-extrabold tracking-tight sm:text-4xl">
          Decid<span className="text-primary">r</span>
        </h1>
        <div className="flex gap-2">
          <button className={iconBtn} onClick={() => setMuted(!muted)} aria-label="Toggle sound">{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
          <button className={iconBtn} onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button className={`${iconBtn} relative`} onClick={() => setOpen(true)} aria-label="History">
            <History size={20} />
            {history.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">{history.length}</span>}
          </button>
        </div>
      </header>

      <nav className="glass mb-8 grid grid-cols-3 gap-1 rounded-2xl p-1.5">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-xl px-2 py-3 text-sm font-bold transition sm:text-base ${tab === t.id ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-muted"}`}>
            <span className="mr-1">{t.emoji}</span><span className="hidden sm:inline">{t.label}</span><span className="sm:hidden">{t.label.split(" ").pop()}</span>
          </button>
        ))}
      </nav>

      <main>
        {tab === "wheel" && <Wheel onResult={log} />}
        {tab === "coin" && <Coin onResult={log} />}
        {tab === "pick" && <Picker onResult={log} />}
      </main>

      <div className={`fixed inset-0 z-40 bg-background/40 backdrop-blur-sm transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setOpen(false)} />
      <aside className={`fixed right-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-popover p-5 shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">History</h2>
          <button onClick={() => setOpen(false)} aria-label="Close"><X /></button>
        </div>
        <ul className="flex-1 space-y-2 overflow-auto">
          {history.length === 0 && <li className="text-muted-foreground">No decisions yet.</li>}
          {history.map((h, i) => (
            <li key={i} className="rounded-xl bg-muted px-3 py-2">
              <p className="truncate font-semibold">{h.r}</p>
              <p className="text-xs text-muted-foreground">{h.t}</p>
            </li>
          ))}
        </ul>
        {history.length > 0 && <button onClick={() => setHistory([])} className="mt-3 rounded-xl bg-muted py-2 font-semibold">Clear</button>}
      </aside>
    </div>
  );
}
