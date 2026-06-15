import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useStore, sessionTotals } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { Star, CheckCircle2, ChefHat, Bell, Soup, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/track/$sessionId")({
  head: () => ({ meta: [{ title: "Order tracking — ServeQ" }, { name: "description", content: "Live status of your order." }] }),
  component: TrackPage,
});

const stages: { key: OrderStatus; label: string; icon: any }[] = [
  { key: "pending", label: "Received", icon: Bell },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: Soup },
  { key: "served", label: "Served", icon: CheckCircle2 },
];

function TrackPage() {
  const { sessionId } = Route.useParams();
  useStore((s) => s._tick); // subscribe to updates
  const session = useStore((s) => s.sessions.find((x) => x.id === sessionId));
  const submitFeedback = useStore((s) => s.submitFeedback);
  const totals = session ? sessionTotals(session.id) : null;
  const tables = useStore((s) => s.tables);
  const table = session ? tables.find(t=>t.id===session.tableId) : null;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!session || !totals) {
    return (
      <div className="min-h-screen">
        <AppHeader title="Order tracking" />
        <div className="max-w-md mx-auto p-10 text-center">
          <h1 className="font-display text-2xl">No active session</h1>
          <Link to="/" className="inline-block mt-4 rounded-full bg-primary text-primary-foreground px-5 py-2.5">Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <AppHeader title={`Table ${table?.number ?? ""} · Tracking`} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/menu/$tableId" params={{ tableId: session.tableId }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Add more items
          </Link>
          <div className="text-xs text-muted-foreground">Session #{session.id.slice(-6)}</div>
        </div>

        {totals.orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}

        {totals.orders.map((o) => {
          const stageIdx = stages.findIndex((s) => s.key === o.status);
          return (
            <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-card border border-border/60 p-5 sm:p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Order #{o.id.slice(-6)}</div>
                  <div className="font-display text-lg mt-0.5">{o.items.length} items · {new Date(o.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</div>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">{o.status}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                {stages.map((s, i) => {
                  const active = i <= stageIdx;
                  return (
                    <div key={s.key} className="flex-1 flex flex-col items-center text-center">
                      <motion.div animate={{ scale: i === stageIdx ? [1, 1.08, 1] : 1 }} transition={{ repeat: i === stageIdx ? Infinity : 0, duration: 1.6 }}
                        className={`size-10 rounded-full grid place-items-center transition ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        <s.icon className="size-4" />
                      </motion.div>
                      <div className={`text-[10px] uppercase tracking-wider mt-1.5 ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                      {i < stages.length - 1 && <div className={`h-0.5 w-full mt-3 -mb-3 ${i < stageIdx ? "bg-primary" : "bg-border"}`} />}
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 grid gap-1.5 text-sm">
                {o.items.map((i) => (
                  <div key={i.menuItemId} className="flex justify-between">
                    <span>{i.qty}× {i.name} {i.instructions && <em className="text-muted-foreground">— {i.instructions}</em>}</span>
                    <span>${(i.price * i.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        <div className="rounded-3xl bg-secondary/60 p-6">
          <h3 className="font-display text-xl mb-3">Live bill</h3>
          <div className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={totals.subtotal} />
            <Row label="Service" value={totals.serviceCharge} />
            <Row label="Tax" value={totals.tax} />
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-display text-lg">
              <span>Total</span><span className="text-primary">${totals.total.toFixed(2)}</span>
            </div>
            <div className="text-xs mt-1">{session.paid ? <span className="text-emerald-700">Paid ✓</span> : <span className="text-muted-foreground">Awaiting payment</span>}</div>
          </div>
        </div>

        {totals.orders.length > 0 && (
          <div className="rounded-3xl bg-card border border-border/60 p-6">
            <h3 className="font-display text-xl">How was it?</h3>
            {session.feedback ? (
              <p className="mt-2 text-sm text-muted-foreground">Thanks — we received your {session.feedback.rating}★ feedback.</p>
            ) : (
              <>
                <div className="mt-3 flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setRating(n)} className="p-1">
                      <Star className={`size-7 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <textarea value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Tell us more (optional)"
                  className="mt-3 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40" rows={3} />
                <button onClick={() => { submitFeedback(session.id, rating, comment); toast.success("Thanks for your feedback!"); }}
                  className="mt-3 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">Submit feedback</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span>${value.toFixed(2)}</span></div>;
}
