import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/AppHeader";
import { useStore } from "@/lib/store";
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [
      { title: "Reserve a table — ServeQ" },
      { name: "description", content: "Book your table in seconds. No phone calls, no waiting." },
    ],
  }),
  component: ReservePage,
});

const TIMES = ["12:00", "12:30", "13:00", "13:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

function ReservePage() {
  const navigate = useNavigate();
  const addReservation = useStore((s) => s.addReservation);
  const reservations = useStore((s) => s.reservations);
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: "19:00", guests: 2, notes: "",
  });
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error("Name and phone are required");
    addReservation(form);
    setDone(true);
    toast.success("Reservation confirmed!");
  }

  if (done) {
    return (
      <div className="min-h-screen">
        <AppHeader title="Reservation" />
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <div className="size-16 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto"><CheckCircle2 className="size-8" /></div>
          <h1 className="font-display text-3xl mt-5">You're booked, {form.name.split(" ")[0]}.</h1>
          <p className="mt-2 text-muted-foreground">A table for {form.guests} on {form.date} at {form.time}. We'll text {form.phone} a reminder.</p>
          <div className="mt-7 flex gap-2 justify-center">
            <button onClick={() => { setDone(false); setForm({ ...form, name: "", phone: "", email: "", notes: "" }); }} className="rounded-full bg-secondary px-5 py-2.5 text-sm">Book another</button>
            <button onClick={() => navigate({ to: "/" })} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="Reserve" />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-5 gap-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Book a table</div>
          <h1 className="font-display text-4xl sm:text-5xl mt-3">Save your seat.</h1>
          <p className="mt-3 text-muted-foreground">Choose a date, time, and party size. Confirmed instantly — we'll hold the table for 15 minutes past your slot.</p>
          <div className="mt-6 rounded-3xl bg-card border border-border/60 overflow-hidden aspect-[4/3]">
            <img alt="Dining room" loading="lazy" className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=70" />
          </div>
          {reservations.length > 0 && (
            <div className="mt-5 text-xs text-muted-foreground">{reservations.length} reservation{reservations.length === 1 ? "" : "s"} held today.</div>
          )}
        </motion.div>

        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-3 rounded-3xl bg-card border border-border/60 p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Full name *">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </Field>
            <Field label="Phone *">
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </Field>
            <Field label="Guests" icon={Users}>
              <select value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} className="input">
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
              </select>
            </Field>
            <Field label="Date" icon={Calendar}>
              <input type="date" value={form.date} min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
            </Field>
            <Field label="Time" icon={Clock}>
              <div className="grid grid-cols-4 gap-1.5">
                {TIMES.map((t) => (
                  <button type="button" key={t} onClick={() => setForm({ ...form, time: t })}
                    className={`rounded-lg px-2 py-1.5 text-xs ${form.time === t ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{t}</button>
                ))}
              </div>
            </Field>
          </div>
          <Field label="Notes (allergies, occasion…)">
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input resize-none" />
          </Field>
          <button type="submit" className="w-full rounded-2xl bg-primary text-primary-foreground py-3.5 font-medium shadow-soft hover:opacity-90 transition">
            Confirm reservation
          </button>
        </motion.form>
      </section>
      <style>{`.input{width:100%;border-radius:0.75rem;background:var(--background);border:1px solid var(--border);padding:.65rem .85rem;font-size:.875rem;outline:none}.input:focus{box-shadow:0 0 0 3px color-mix(in oklab, var(--ring) 30%, transparent)}`}</style>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
        {Icon && <Icon className="size-3" />} {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
