import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore, sessionTotals } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { CreditCard, Plus, Minus, ShoppingBag, Printer, Receipt, X, Package } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Category, OrderItem } from "@/lib/types";

export const Route = createFileRoute("/reception")({
  head: () => ({ meta: [{ title: "Reception — ServeQ" }, { name: "description", content: "Tables, live bills, payments, takeaway." }] }),
  component: ReceptionPage,
});

const TAKEAWAY_ID = "takeaway";

function ReceptionPage() {
  const navigate = useNavigate();
  const auth = useStore((s) => s.auth);
  useEffect(() => {
    if (!auth || (auth.role !== "receptionist" && auth.role !== "admin")) navigate({ to: "/login" });
  }, [auth, navigate]);

  useStore((s) => s._tick);
  const tables = useStore((s) => s.tables);
  const sessions = useStore((s) => s.sessions);
  const orders = useStore((s) => s.orders);
  const markPaid = useStore((s) => s.markPaid);
  const setTableStatus = useStore((s) => s.setTableStatus);

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedTakeaway, setSelectedTakeaway] = useState<string | null>(null);
  const [takeawayOpen, setTakeawayOpen] = useState(false);

  const takeawaySessions = sessions.filter((s) => s.tableId === TAKEAWAY_ID);

  const detailTable = tables.find((t) => t.id === selectedTable);
  const detailSession = detailTable?.sessionId
    ? sessions.find((s) => s.id === detailTable.sessionId)
    : selectedTakeaway
      ? sessions.find((s) => s.id === selectedTakeaway)
      : null;
  const detailTotals = detailSession ? sessionTotals(detailSession.id) : null;

  function closeDetail() {
    setSelectedTable(null);
    setSelectedTakeaway(null);
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="Reception" subtitle={`${tables.filter((t) => t.status === "occupied").length} occupied · ${takeawaySessions.filter((s) => !s.paid).length} takeaway open`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
        {/* Floor map */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl">Floor map</h2>
              <p className="text-xs text-muted-foreground">Tap any table to view its detailed bill.</p>
            </div>
            <button
              onClick={() => setTakeawayOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition"
            >
              <Package className="size-4" /> New takeaway order
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {tables.map((t) => {
              const sess = t.sessionId ? sessions.find((s) => s.id === t.sessionId) : null;
              const tot = sess ? sessionTotals(sess.id) : null;
              const tone =
                t.status === "available"
                  ? "bg-emerald-50 border-emerald-200"
                  : t.status === "reserved"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-primary/10 border-primary/30";
              return (
                <motion.button
                  key={t.id}
                  layout
                  onClick={() => {
                    setSelectedTakeaway(null);
                    setSelectedTable(t.id);
                  }}
                  className={`rounded-3xl border p-4 text-left hover:shadow-soft transition ${tone}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Table</div>
                      <div className="font-display text-3xl">{t.number}</div>
                    </div>
                    <span className="text-[10px] rounded-full bg-background/70 px-2 py-0.5 capitalize">{t.status}</span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {tot ? (
                      <>
                        <div>{tot.orders.length} orders</div>
                        <div className="font-display text-base text-foreground mt-0.5">${tot.total.toFixed(2)}</div>
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Takeaway */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl">Takeaway orders</h2>
              <p className="text-xs text-muted-foreground">Phone, walk-in, and pickup orders.</p>
            </div>
          </div>
          {takeawaySessions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No takeaway orders yet. Click <span className="font-medium text-foreground">New takeaway order</span> to create one.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {takeawaySessions
                .slice()
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((s) => {
                  const tot = sessionTotals(s.id);
                  const cust = orders.find((o) => o.sessionId === s.id)?.customer;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedTable(null);
                        setSelectedTakeaway(s.id);
                      }}
                      className={`text-left rounded-3xl border p-4 hover:shadow-soft transition ${s.paid ? "bg-emerald-50 border-emerald-200" : "bg-card border-border/60"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="size-4 text-primary" />
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">Takeaway #{s.id.slice(-5)}</div>
                        </div>
                        <span className="text-[10px] rounded-full bg-background/70 px-2 py-0.5">{s.paid ? "Paid" : "Open"}</span>
                      </div>
                      <div className="mt-2 font-medium">{cust?.name ?? "Walk-in"}</div>
                      <div className="text-xs text-muted-foreground">{cust?.phone ?? "—"}</div>
                      <div className="mt-3 flex justify-between items-end">
                        <div className="text-xs text-muted-foreground">{tot.orders.length} orders</div>
                        <div className="font-display text-lg text-primary">${tot.total.toFixed(2)}</div>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </section>
      </div>

      {/* Detailed bill dialog */}
      <Dialog open={!!detailSession || (!!detailTable && !detailSession)} onOpenChange={(o) => !o && closeDetail()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailTable && !detailSession && (
            <>
              <DialogHeader>
                <DialogTitle>Table {detailTable.number}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">No active session. Change table status:</p>
              <div className="flex gap-2">
                {(["available", "reserved", "occupied"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setTableStatus(detailTable.id, st);
                      toast.success(`Table set to ${st}`);
                    }}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm capitalize ${detailTable.status === st ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </>
          )}
          {detailSession && detailTotals && (
            <BillDetail
              session={detailSession}
              totals={detailTotals}
              table={detailTable ?? null}
              onPaid={() => {
                markPaid(detailSession.id);
                toast.success("Marked as paid");
                closeDetail();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Takeaway dialog */}
      <TakeawayDialog open={takeawayOpen} onOpenChange={setTakeawayOpen} />
    </div>
  );
}

function BillDetail({
  session,
  totals,
  table,
  onPaid,
}: {
  session: { id: string; tableId: string; paid: boolean; createdAt: number };
  totals: ReturnType<typeof sessionTotals>;
  table: { number: number } | null;
  onPaid: () => void;
}) {
  const settings = useStore((s) => s.settings);
  const isTakeaway = session.tableId === TAKEAWAY_ID;
  const customer = totals.orders[0]?.customer;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Receipt className="size-5 text-primary" />
          {isTakeaway ? `Takeaway #${session.id.slice(-5)}` : `Table ${table?.number} · Bill`}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-secondary/60 p-3">
          <div className="text-muted-foreground">Opened</div>
          <div className="font-medium text-foreground mt-0.5">{new Date(session.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</div>
        </div>
        <div className="rounded-xl bg-secondary/60 p-3">
          <div className="text-muted-foreground">Customer</div>
          <div className="font-medium text-foreground mt-0.5">{customer?.name ?? "—"}</div>
          <div className="text-[11px] text-muted-foreground">{customer?.phone ?? ""}</div>
        </div>
      </div>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
        {totals.orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No orders yet.</p>}
        {totals.orders
          .slice()
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((o) => {
            const orderTotal = o.items.reduce((a, i) => a + i.price * i.qty, 0);
            const statusTone =
              o.status === "served"
                ? "bg-emerald-100 text-emerald-900"
                : o.status === "ready"
                  ? "bg-amber-100 text-amber-900"
                  : o.status === "preparing"
                    ? "bg-sky-100 text-sky-900"
                    : "bg-muted text-muted-foreground";
            return (
              <div key={o.id} className="rounded-xl border border-border/60 p-3 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Order #{o.id.slice(-5)}</span>
                    <span className={`text-[10px] rounded-full px-2 py-0.5 capitalize ${statusTone}`}>{o.status}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {o.items.map((i) => (
                  <div key={i.menuItemId} className="flex justify-between py-0.5">
                    <span>
                      {i.qty}× {i.name}
                      {i.instructions && <span className="block text-[11px] text-muted-foreground italic">↳ {i.instructions}</span>}
                    </span>
                    <span>${(i.qty * i.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-border/60 mt-2 pt-1 flex justify-between text-xs text-muted-foreground">
                  <span>Order subtotal</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
      </div>

      <div className="rounded-xl bg-secondary/60 p-3 text-sm space-y-1">
        <Row label="Subtotal" value={totals.subtotal} />
        <Row label={`Service (${settings.serviceChargePct}%)`} value={totals.serviceCharge} />
        <Row label={`Tax (${settings.taxPct}%)`} value={totals.tax} />
        <div className="border-t border-border pt-2 mt-1 flex justify-between font-display text-lg">
          <span>Total</span>
          <span className="text-primary">${totals.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => window.print()} className="flex-1 rounded-xl bg-secondary py-3 text-sm font-medium inline-flex items-center justify-center gap-2">
          <Printer className="size-4" /> Print
        </button>
        {session.paid ? (
          <div className="flex-1 rounded-xl bg-emerald-100 text-emerald-900 py-3 text-sm text-center font-medium">Paid ✓</div>
        ) : (
          <button onClick={onPaid} disabled={totals.orders.length === 0} className="flex-1 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50">
            <CreditCard className="size-4" /> Mark paid
          </button>
        )}
      </div>
    </>
  );
}

function TakeawayDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const menu = useStore((s) => s.menu);
  const settings = useStore((s) => s.settings);
  const startSession = useStore((s) => s.startSession);
  const placeOrder = useStore((s) => s.placeOrder);

  const [cat, setCat] = useState<Category | "All">("All");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });

  const categories: (Category | "All")[] = ["All", "Specials", "Food", "Drinks", "Desserts"];
  const filtered = useMemo(() => menu.filter((m) => (cat === "All" || m.category === cat) && m.available), [menu, cat]);

  const subtotal = cart.reduce((a, l) => a + l.price * l.qty, 0);
  const serviceCharge = (subtotal * settings.serviceChargePct) / 100;
  const tax = (subtotal * settings.taxPct) / 100;
  const total = subtotal + serviceCharge + tax;

  function add(id: string) {
    const m = menu.find((x) => x.id === id);
    if (!m) return;
    setCart((c) => {
      const ex = c.find((l) => l.menuItemId === id);
      if (ex) return c.map((l) => (l.menuItemId === id ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { menuItemId: id, name: m.name, price: m.price, qty: 1 }];
    });
  }
  function setQty(id: string, qty: number) {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.menuItemId !== id) : c.map((l) => (l.menuItemId === id ? { ...l, qty } : l))));
  }

  function reset() {
    setCart([]);
    setCustomer({ name: "", phone: "", email: "" });
    setCat("All");
  }

  function submit() {
    if (!customer.name || !customer.phone) return toast.error("Add customer name and phone.");
    if (cart.length === 0) return toast.error("Add at least one item.");
    const sessionId = startSession(TAKEAWAY_ID);
    placeOrder({ tableId: TAKEAWAY_ID, sessionId, items: cart, customer });
    toast.success("Takeaway order placed!");
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-5 text-primary" /> New takeaway order
          </DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-3 gap-2">
          <input value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} placeholder="Customer name *" className="rounded-xl bg-background border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          <input value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} placeholder="Phone *" className="rounded-xl bg-background border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          <input value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} placeholder="Email" className="rounded-xl bg-background border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${cat === c ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-2 max-h-[35vh] overflow-y-auto pr-1">
          {filtered.map((m) => {
            const inCart = cart.find((l) => l.menuItemId === m.id);
            return (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border/60 p-3">
                <div className="size-10 rounded-xl bg-secondary grid place-items-center text-xl shrink-0">{m.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">${m.price.toFixed(2)}</div>
                </div>
                {inCart ? (
                  <div className="inline-flex items-center gap-1 rounded-full bg-secondary p-0.5">
                    <button onClick={() => setQty(m.id, inCart.qty - 1)} className="size-6 rounded-full bg-background grid place-items-center"><Minus className="size-3" /></button>
                    <span className="text-xs w-5 text-center font-medium">{inCart.qty}</span>
                    <button onClick={() => setQty(m.id, inCart.qty + 1)} className="size-6 rounded-full bg-primary text-primary-foreground grid place-items-center"><Plus className="size-3" /></button>
                  </div>
                ) : (
                  <button onClick={() => add(m.id)} className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    <Plus className="size-3" /> Add
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {cart.length > 0 && (
          <div className="rounded-xl bg-secondary/60 p-3 text-sm space-y-1">
            <Row label="Subtotal" value={subtotal} />
            <Row label={`Service (${settings.serviceChargePct}%)`} value={serviceCharge} />
            <Row label={`Tax (${settings.taxPct}%)`} value={tax} />
            <div className="border-t border-border pt-2 mt-1 flex justify-between font-display text-base">
              <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => onOpenChange(false)} className="flex-1 rounded-xl bg-secondary py-3 text-sm font-medium inline-flex items-center justify-center gap-2">
            <X className="size-4" /> Cancel
          </button>
          <button onClick={submit} className="flex-1 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium inline-flex items-center justify-center gap-2">
            <ShoppingBag className="size-4" /> Place order · ${total.toFixed(2)}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}
