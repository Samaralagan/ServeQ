import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { PhotoGallery } from "@/components/PhotoGallery";
import { QrCode, ChefHat, Receipt, ShieldCheck, Sparkles, ArrowRight, CalendarHeart, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ServeQ — Scan. Order. Serve." },
      { name: "description", content: "QR-based ordering, real-time kitchen dashboards, live billing, and analytics for modern restaurants." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const tables = useStore((s) => s.tables);
  const [qr, setQr] = useState<string>("");
  const demoTable = tables[0];

  useEffect(() => {
    if (!demoTable) return;
    const url = `${window.location.origin}/menu/${demoTable.id}`;
    QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: "#3a2e23", light: "#00000000" } }).then(setQr);
  }, [demoTable]);

  return (
    <div className="min-h-screen">
      <AppHeader title="Cloud Restaurant Suite" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 grain"
          style={{ background: "radial-gradient(60% 60% at 70% 20%, color-mix(in oklab, var(--sand) 60%, transparent), transparent), radial-gradient(50% 60% at 20% 80%, color-mix(in oklab, var(--cream) 80%, transparent), transparent)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Sparkles className="size-3.5" /> The end of waving for the waiter
            </div>
            <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight">
              Scan. Order. <span className="italic text-primary">Savor.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              ServeQ replaces waiter ordering with a beautifully fast QR flow — and powers your kitchen,
              billing, and analytics from a single cloud dashboard.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {demoTable && (
                <Link to="/menu/$tableId" params={{ tableId: demoTable.id }}
                  className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium shadow-soft hover:translate-y-[-1px] transition">
                  Try the diner view <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" />
                </Link>
              )}
              <Link to="/reserve" className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-medium hover:bg-accent transition">
                <CalendarHeart className="size-4" /> Reserve a table
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-medium hover:bg-accent transition">
                <BookOpen className="size-4" /> Our story
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-medium hover:bg-accent transition">
                Staff dashboards
              </Link>
            </div>

            
          </motion.div>

          {/* QR card */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="relative mx-auto">
            <div className="relative glass grain rounded-[2rem] p-8 w-[20rem] sm:w-[22rem] float">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Table 01 · ServeQ</div>
                <h3 className="font-display text-2xl mt-1">Scan to order</h3>
              </div>
              <div className="mt-5 rounded-2xl bg-background/70 p-4 grid place-items-center min-h-[280px]">
                {qr ? <img src={qr} alt="QR code for table 1" className="w-full h-auto" /> : <div className="skeleton size-64 rounded-xl" />}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <QrCode className="size-3.5" /> Opens menu instantly · no app needed
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 sm:-right-10 rounded-2xl glass-dark text-primary-foreground px-4 py-3 shadow-glass">
              <div className="text-[10px] uppercase tracking-widest opacity-80">Live now</div>
              <div className="text-sm font-medium">3 orders in kitchen</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <h2 className="font-display text-3xl sm:text-4xl">One platform, every role.</h2>
          <p className="text-muted-foreground max-w-md">From the diner's phone to the GM's analytics — purpose-built dashboards for every seat in the house.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: "/menu/" + (demoTable?.id ?? "t1"), icon: QrCode, title: "Diner", desc: "QR menu, cart, live order tracking, feedback." },
            { to: "/login", icon: ChefHat, title: "Chef", desc: "Realtime ticket feed, status flow, priority queue." },
            { to: "/login", icon: Receipt, title: "Reception", desc: "Table map, running bills, payments." },
            { to: "/login", icon: ShieldCheck, title: "Admin", desc: "Menu, tables, analytics, configuration." },
          ].map((r, i) => (
            <motion.a key={r.title} href={r.to}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group rounded-3xl bg-card border border-border/60 p-6 hover:shadow-soft hover:-translate-y-0.5 transition">
              <div className="size-11 rounded-2xl bg-secondary grid place-items-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition">
                <r.icon className="size-5" />
              </div>
              <div className="font-display text-xl">{r.title}</div>
              <p className="text-sm text-muted-foreground mt-1.5">{r.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Open <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition" />
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      <TestimonialSlider />

      <PhotoGallery />

      <footer className="border-t border-border/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} ServeQ. Crafted for hospitality.</div>
          <div className="flex gap-4">
            <Link to="/reserve" className="hover:text-foreground">Reservations</Link>
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/login" className="hover:text-foreground">Staff login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}