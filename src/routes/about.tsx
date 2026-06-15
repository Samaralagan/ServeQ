import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { motion } from "framer-motion";
import { Leaf, Clock, Users, Award, MapPin, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ServeQ" },
      { name: "description", content: "Our story, our kitchen, our hospitality philosophy." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <AppHeader title="About" />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Our story</div>
          <h1 className="font-display text-4xl sm:text-6xl mt-3 max-w-3xl leading-[1.05]">
            Made with patience, served with <span className="italic text-primary">precision</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground">
            ServeQ started as a tiny neighborhood kitchen in 2019. Today we serve thousands of diners a week, powered by
            QR ordering and a kitchen team that still treats every plate like its first.
          </p>
        </motion.div>

        <div className="mt-10 grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-secondary">
            <img alt="Open kitchen at ServeQ" loading="lazy" className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=70" />
          </div>
          <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-secondary">
            <img alt="Dining room" loading="lazy" className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=70" />
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Leaf, k: "Locally sourced", v: "Within 80 miles, daily." },
            { icon: Clock, k: "<12 min", v: "Avg. order to plate." },
            { icon: Users, k: "60+ staff", v: "Across kitchen & floor." },
            { icon: Award, k: "4.9 / 5", v: "1,400+ diner reviews." },
          ].map((s) => (
            <div key={s.k} className="rounded-3xl bg-card border border-border/60 p-5">
              <div className="size-10 rounded-2xl bg-secondary text-primary grid place-items-center"><s.icon className="size-5" /></div>
              <div className="font-display text-2xl mt-3">{s.k}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            { icon: MapPin, t: "Visit", d: "221 Olive Lane, Old Town" },
            { icon: Phone, t: "Call", d: "+1 (555) 010-2233" },
            { icon: Mail, t: "Email", d: "hello@serveq.app" },
          ].map((c) => (
            <div key={c.t} className="rounded-3xl bg-card border border-border/60 p-5 flex items-center gap-4">
              <div className="size-11 rounded-2xl bg-primary text-primary-foreground grid place-items-center"><c.icon className="size-5" /></div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.t}</div>
                <div className="font-medium mt-0.5">{c.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/reserve" className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium">Reserve a table</Link>
          <Link to="/" className="rounded-full bg-secondary px-6 py-3 text-sm font-medium">Back home</Link>
        </div>
      </section>
    </div>
  );
}
