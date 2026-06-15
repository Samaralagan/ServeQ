import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, sessionTotals } from "@/lib/store";
import type { Category, OrderItem } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, X, CheckCircle2, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/menu/$tableId")({
  head: ({ params }) => ({
    meta: [
      { title: `Table ${params.tableId} · Menu — ServeQ` },
      { name: "description", content: "Browse the menu and place your order right from your table." },
    ],
  }),
  component: MenuPage,
});

interface CartLine extends OrderItem {}

function MenuPage() {
  const { tableId } = Route.useParams();
  const navigate = useNavigate();
  const menu = useStore((s) => s.menu);
  const tables = useStore((s) => s.tables);
  const startSession = useStore((s) => s.startSession);
  const placeOrder = useStore((s) => s.placeOrder);
  const settings = useStore((s) => s.settings);

  const table = tables.find((t) => t.id === tableId);
  const [cat, setCat] = useState<Category | "All">("All");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [placing, setPlacing] = useState(false);

  const categories: (Category | "All")[] = ["All", "Specials", "Food", "Drinks", "Desserts"];
  const filtered = useMemo(() => menu.filter((m) => cat === "All" || m.category === cat), [menu, cat]);

  const subtotal = cart.reduce((a, l) => a + l.price * l.qty, 0);
  const serviceCharge = (subtotal * settings.serviceChargePct) / 100;
  const tax = (subtotal * settings.taxPct) / 100;
  const total = subtotal + serviceCharge + tax;

  function add(id: string) {
    const m = menu.find((x) => x.id === id);
    if (!m || !m.available) return;
    setCart((c) => {
      const ex = c.find((l) => l.menuItemId === id);
      if (ex) return c.map((l) => l.menuItemId === id ? { ...l, qty: l.qty + 1 } : l);
      return [...c, { menuItemId: id, name: m.name, price: m.price, qty: 1 }];
    });
  }
  function setQty(id: string, qty: number) {
    setCart((c) => qty <= 0 ? c.filter((l) => l.menuItemId !== id) : c.map((l) => l.menuItemId === id ? { ...l, qty } : l));
  }
  function setNote(id: string, note: string) {
    setCart((c) => c.map((l) => l.menuItemId === id ? { ...l, instructions: note } : l));
  }

  async function submitOrder() {
    if (!table) return;
    if (!customer.name || !customer.phone) return toast.error("Please add your name and phone.");
    if (cart.length === 0) return toast.error("Your cart is empty.");
    setPlacing(true);
    const sessionId = startSession(tableId);
    const order = placeOrder({ tableId, sessionId, items: cart, customer });
    setCart([]);
    setOpen(false);
    setPlacing(false);
    toast.success("Order sent to the kitchen!");
    navigate({ to: "/track/$sessionId", params: { sessionId: order.sessionId } });
  }

  if (!table) {
    return (
      <div className="min-h-screen">
        <AppHeader title="Table not found" />
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <h1 className="font-display text-3xl">Hmm, that table isn't here</h1>
          <p className="mt-2 text-muted-foreground">Scan the QR code on your table or ask staff for help.</p>
          <Link to="/" className="inline-block mt-6 rounded-full bg-primary text-primary-foreground px-5 py-2.5">Back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <AppHeader title={`Table ${table.number}`} subtitle="Welcome — enjoy your meal" />

      {/* Hero strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="glass grain rounded-3xl p-5 sm:p-7 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Now serving</div>
            <h1 className="font-display text-3xl sm:text-4xl mt-1">Table {table.number}</h1>
            <p className="text-sm text-muted-foreground mt-1">Tap any dish to add it to your bill. Order as many times as you like.</p>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-xs text-muted-foreground">Running total</div>
            <div className="font-display text-2xl text-primary">${total.toFixed(2)}</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="sticky top-[60px] z-20 bg-background/70 backdrop-blur border-b border-border/40 mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${cat === c ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m, i) => {
          const inCart = cart.find((l) => l.menuItemId === m.id);
          return (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`rounded-3xl bg-card border border-border/60 overflow-hidden flex flex-col ${!m.available ? "opacity-60" : "hover:shadow-soft hover:-translate-y-0.5"} transition`}>
              <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                {m.image ? (
                  <img src={m.image} alt={m.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-6xl">{m.emoji}</div>
                )}
                <div className="absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-background/85 backdrop-blur rounded-full px-2.5 py-1">{m.category}</div>
                {!m.available && <div className="absolute top-3 right-3 text-[10px] uppercase bg-destructive text-destructive-foreground rounded-full px-2.5 py-1">86'd</div>}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display text-lg leading-tight">{m.name}</div>
                  <div className="font-display text-lg text-primary shrink-0">${m.price.toFixed(2)}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">{m.description}</p>
                <div className="mt-3">
                  {!m.available ? (
                    <span className="text-xs text-destructive">Unavailable</span>
                  ) : inCart ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-secondary p-1">
                      <button onClick={() => setQty(m.id, inCart.qty - 1)} className="size-7 rounded-full bg-background grid place-items-center"><Minus className="size-3.5" /></button>
                      <span className="text-sm w-6 text-center font-medium">{inCart.qty}</span>
                      <button onClick={() => setQty(m.id, inCart.qty + 1)} className="size-7 rounded-full bg-primary text-primary-foreground grid place-items-center"><Plus className="size-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => add(m.id)} className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-medium hover:opacity-90 transition">
                      <Plus className="size-3.5" /> Add
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Floating cart button */}
      <AnimatePresence>
        {cart.length > 0 && !open && (
          <motion.button
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground pl-4 pr-2 py-2 shadow-glass pulse-ring">
            <ShoppingBag className="size-5" />
            <span className="text-sm font-medium">{cart.reduce((a,l)=>a+l.qty,0)} items · ${total.toFixed(2)}</span>
            <span className="ml-1 rounded-full bg-background/20 px-3 py-1.5 text-xs">Review</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer / sticky panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border/60 px-5 py-4 flex items-center justify-between">
                <h2 className="font-display text-xl">Your order</h2>
                <button onClick={() => setOpen(false)} className="size-9 rounded-full bg-secondary grid place-items-center"><X className="size-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                {cart.map((l) => (
                  <div key={l.menuItemId} className="rounded-2xl bg-secondary/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground">${l.price.toFixed(2)} each</div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-background p-1">
                        <button onClick={() => setQty(l.menuItemId, l.qty - 1)} className="size-7 rounded-full bg-secondary grid place-items-center"><Minus className="size-3.5" /></button>
                        <span className="text-sm w-6 text-center font-medium">{l.qty}</span>
                        <button onClick={() => setQty(l.menuItemId, l.qty + 1)} className="size-7 rounded-full bg-primary text-primary-foreground grid place-items-center"><Plus className="size-3.5" /></button>
                      </div>
                    </div>
                    <input value={l.instructions ?? ""} onChange={(e)=>setNote(l.menuItemId, e.target.value)}
                      placeholder="Special instructions (e.g. no onions)"
                      className="mt-3 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
                  </div>
                ))}

                <div className="rounded-2xl bg-secondary/60 p-4 space-y-2 text-sm">
                  <Row label="Subtotal" value={subtotal} />
                  <Row label={`Service (${settings.serviceChargePct}%)`} value={serviceCharge} />
                  <Row label={`Tax (${settings.taxPct}%)`} value={tax} />
                  <div className="border-t border-border/60 pt-2 mt-2 flex justify-between font-display text-lg">
                    <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <input value={customer.name} onChange={(e)=>setCustomer(c=>({...c,name:e.target.value}))} placeholder="Your name *"
                    className="rounded-xl bg-background border border-border px-3 py-3 outline-none focus:ring-2 focus:ring-ring/40" />
                  <input value={customer.phone} onChange={(e)=>setCustomer(c=>({...c,phone:e.target.value}))} placeholder="Phone *"
                    className="rounded-xl bg-background border border-border px-3 py-3 outline-none focus:ring-2 focus:ring-ring/40" />
                  <input value={customer.email} onChange={(e)=>setCustomer(c=>({...c,email:e.target.value}))} placeholder="Email"
                    className="rounded-xl bg-background border border-border px-3 py-3 outline-none focus:ring-2 focus:ring-ring/40" />
                </div>

                <button disabled={placing} onClick={submitOrder}
                  className="w-full rounded-2xl bg-primary text-primary-foreground py-4 font-medium shadow-soft hover:opacity-90 transition inline-flex items-center justify-center gap-2">
                  {placing ? "Sending…" : <><CheckCircle2 className="size-5" /> Place order</>}
                </button>
                <Link to="/track/$sessionId" params={{ sessionId: tables.find(t=>t.id===tableId)?.sessionId ?? "x" }}
                  className="block text-center text-sm text-muted-foreground hover:text-foreground">
                  <ClipboardList className="inline size-4 mr-1" /> View existing orders for this table
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span>${value.toFixed(2)}</span></div>
  );
}
