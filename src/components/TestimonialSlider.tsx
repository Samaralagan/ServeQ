import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { Star, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { toast } from "sonner";

export function TestimonialSlider() {
  const testimonials = useStore((s) => s.testimonials);
  const addTestimonial = useStore((s) => s.addTestimonial);
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = setInterval(() => setI((x) => (x + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;
  const t = testimonials[i % testimonials.length];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Loved by diners</div>
          <h2 className="font-display text-3xl sm:text-4xl mt-2">{testimonials.length} stories and counting.</h2>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition">
          <Plus className="size-4" /> Share your experience
        </button>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.article
            key={t.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-card border border-border/60 p-8 sm:p-12 shadow-soft"
          >
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-secondary grid place-items-center font-display text-2xl text-primary">
                {t.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-display text-lg">{t.name}</div>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`size-4 ${j < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-6 font-display text-xl sm:text-2xl leading-relaxed text-foreground/90">
              "{t.comment}"
            </p>
            <div className="mt-6 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</div>
          </motion.article>
        </AnimatePresence>

        {testimonials.length > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <div className="flex gap-1.5">
              {testimonials.map((_, j) => (
                <button key={j} onClick={() => setI(j)} aria-label={`Go to review ${j + 1}`}
                  className={`h-1.5 rounded-full transition-all ${j === i % testimonials.length ? "w-8 bg-primary" : "w-1.5 bg-border"}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setI((x) => (x - 1 + testimonials.length) % testimonials.length)} className="size-10 rounded-full bg-secondary hover:bg-accent grid place-items-center"><ChevronLeft className="size-4" /></button>
              <button onClick={() => setI((x) => (x + 1) % testimonials.length)} className="size-10 rounded-full bg-secondary hover:bg-accent grid place-items-center"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && <ReviewModal onClose={() => setOpen(false)} onSubmit={(t) => { addTestimonial(t); toast.success("Thanks for sharing!"); setOpen(false); setI(0); }} />}
      </AnimatePresence>
    </section>
  );
}

function ReviewModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (t: { name: string; rating: number; comment: string }) => void }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  function submit() {
    if (!name.trim()) return toast.error("Please add your name");
    if (!comment.trim()) return toast.error("Please add a comment");
    onSubmit({ name: name.trim(), rating, comment: comment.trim() });
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg rounded-3xl bg-card border border-border/60 p-6 shadow-glass">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl">Share your experience</h3>
            <button onClick={onClose} className="size-9 rounded-full bg-secondary grid place-items-center"><X className="size-4" /></button>
          </div>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Your name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan"
                className="mt-1 w-full rounded-xl bg-background border border-border px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring/40" />
            </label>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Rating</span>
              <div className="mt-1.5 flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <button key={j} type="button" onClick={() => setRating(j + 1)} aria-label={`Rate ${j + 1} stars`}>
                    <Star className={`size-7 transition ${j < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 hover:text-amber-400"}`} />
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Comment</span>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
                placeholder="What did you love about your visit?"
                className="mt-1 w-full rounded-xl bg-background border border-border px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring/40 resize-none" />
            </label>
            <button onClick={submit} className="w-full rounded-2xl bg-primary text-primary-foreground py-3 font-medium hover:opacity-90 transition">
              Post review
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}