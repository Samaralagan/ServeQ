import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { Clock, ChefHat, CheckCircle2, Soup, Eye, EyeOff, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chef")({
  head: () => ({ meta: [{ title: "Kitchen dashboard — ServeQ" }, { name: "description", content: "Live order feed for the kitchen." }] }),
  component: ChefPage,
});

function ChefPage() {
  const navigate = useNavigate();
  const auth = useStore((s) => s.auth);
  const orders = useStore((s) => s.orders);
  const tables = useStore((s) => s.tables);
  const menu = useStore((s) => s.menu);
  const toggleAvailability = useStore((s) => s.toggleAvailability);
  const setStatus = useStore((s) => s.setOrderStatus);
  const lastCountRef = useRef(orders.length);
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"All" | "Food" | "Drinks" | "Desserts" | "Specials">("All");

  useEffect(() => {
    if (!auth || (auth.role !== "chef" && auth.role !== "admin")) navigate({ to: "/login" });
  }, [auth, navigate]);

  // beep on new order
  useEffect(() => {
    if (orders.length > lastCountRef.current && typeof window !== "undefined") {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880; g.gain.value = 0.08;
        o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 180);
      } catch {}
    }
    lastCountRef.current = orders.length;
  }, [orders.length]);

  const active = useMemo(() => orders.filter(o => o.status !== "served").sort((a,b)=>a.createdAt-b.createdAt), [orders]);
  const counts = {
    pending: orders.filter(o=>o.status==="pending").length,
    preparing: orders.filter(o=>o.status==="preparing").length,
    ready: orders.filter(o=>o.status==="ready").length,
  };

  function tableNum(id: string) { return tables.find(t=>t.id===id)?.number ?? "?"; }
  function ageMin(t: number) { return Math.max(0, Math.round((Date.now()-t)/60000)); }

  return (
    <div className="min-h-screen">
      <AppHeader title="Kitchen Dashboard" subtitle={`${active.length} active tickets`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Pending" value={counts.pending} tone="bg-amber-100 text-amber-900" />
          <Stat label="Preparing" value={counts.preparing} tone="bg-blue-100 text-blue-900" />
          <Stat label="Ready" value={counts.ready} tone="bg-emerald-100 text-emerald-900" />
        </div>

        {/* Menu availability toggle */}
        <div className="rounded-3xl bg-card border border-border/60 overflow-hidden">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Soup className="size-5" /></div>
              <div>
                <div className="font-display text-lg leading-tight">Menu availability — 86 board</div>
                <div className="text-xs text-muted-foreground">
                  {menu.filter((m) => m.available).length}/{menu.length} items in service · tap to {showMenu ? "hide" : "manage"}
                </div>
              </div>
            </div>
            <span className="text-xs rounded-full bg-secondary px-3 py-1.5">{showMenu ? "Hide" : "Open"}</span>
          </button>
          {showMenu && (
            <div className="border-t border-border/60 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search items…"
                    className="w-full rounded-xl bg-secondary/60 border border-border/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {(["All", "Food", "Drinks", "Desserts", "Specials"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${cat === c ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {menu
                  .filter((m) => (cat === "All" ? true : m.category === cat))
                  .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
                  .map((m) => (
                    <div key={m.id} className={`flex items-center justify-between rounded-2xl border p-3 transition ${m.available ? "bg-card border-border/60" : "bg-muted/40 border-border/40 opacity-70"}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-xl bg-secondary overflow-hidden grid place-items-center text-lg shrink-0">
                          {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" /> : <span>{m.emoji}</span>}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{m.name}</div>
                          <div className="text-[11px] text-muted-foreground">${m.price.toFixed(2)} · {m.category}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          toggleAvailability(m.id);
                          const next = !m.available;
                          toast.success(`${m.name} ${next ? "back in service" : "marked 86'd"}`);
                        }}
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${m.available ? "bg-emerald-100 text-emerald-900" : "bg-destructive/15 text-destructive"}`}
                      >
                        {m.available ? <><Eye className="size-3.5" /> On</> : <><EyeOff className="size-3.5" /> 86</>}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>


        {active.length === 0 && (
          <div className="rounded-3xl glass grain p-16 text-center">
            <div className="size-14 rounded-2xl bg-primary text-primary-foreground grid place-items-center mx-auto"><ChefHat className="size-7" /></div>
            <p className="mt-4 text-muted-foreground">All clear, chef. Waiting for new tickets…</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
          {active.map((o) => {
            const urgent = ageMin(o.createdAt) >= 10;
            return (
              <motion.div layout key={o.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-3xl border p-5 bg-card ${urgent ? "border-destructive/50 shadow-soft" : "border-border/60"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Order #{o.id.slice(-5)}</div>
                    <div className="font-display text-2xl mt-0.5">Table {tableNum(o.tableId)}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-1 ${urgent ? "bg-destructive/15 text-destructive" : "bg-secondary"}`}>
                    <Clock className="size-3" /> {ageMin(o.createdAt)}m
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {o.items.map((i) => (
                    <li key={i.menuItemId} className="flex justify-between gap-3">
                      <span><span className="font-medium">{i.qty}×</span> {i.name}</span>
                    </li>
                  ))}
                </ul>
                {o.items.some(i => i.instructions) && (
                  <div className="mt-3 rounded-xl bg-secondary/60 p-2.5 text-xs space-y-1">
                    {o.items.filter(i=>i.instructions).map(i => (
                      <div key={i.menuItemId}><strong>{i.name}:</strong> {i.instructions}</div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  {o.status === "pending" && (
                    <button onClick={() => setStatus(o.id, "preparing")} className="flex-1 rounded-xl bg-primary text-primary-foreground py-2 text-sm font-medium inline-flex items-center justify-center gap-1.5">
                      <ChefHat className="size-4" /> Start
                    </button>
                  )}
                  {o.status === "preparing" && (
                    <button onClick={() => setStatus(o.id, "ready")} className="flex-1 rounded-xl bg-emerald-600 text-white py-2 text-sm font-medium inline-flex items-center justify-center gap-1.5">
                      <Soup className="size-4" /> Mark ready
                    </button>
                  )}
                  {o.status === "ready" && (
                    <button onClick={() => setStatus(o.id, "served")} className="flex-1 rounded-xl bg-secondary py-2 text-sm font-medium inline-flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Served
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center justify-between">
        <div className="font-display text-3xl">{value}</div>
        <span className={`text-[10px] rounded-full px-2 py-0.5 ${tone}`}>live</span>
      </div>
    </div>
  );
}
