import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Upload, Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const initialImages = [
  "/photogal1.png",
  "/photogal2.png",
  "/photogal3.png",
  "/photogal4.png",
  "/photogal5.png",
  "/photogal6.png",
];

export function PhotoGallery() {
  const [images, setImages] = useState<string[]>(initialImages);
  const [i, setI] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  const prev = useCallback(() => setI((x) => (x - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setI((x) => (x + 1) % images.length), [images.length]);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, images.length]);

  function handleUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    if (!file.type.startsWith("image/")) return toast.error("Only image files are allowed");
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = String(r.result);
      setImages((prev) => [...prev, dataUrl]);
      toast.success("Photo added to gallery!");
      setShowUpload(false);
    };
    r.readAsDataURL(file);
  }

  function handleRemove(idx: number) {
    setImages((prev) => {
      const next = prev.filter((_, j) => j !== idx);
      if (next.length === 0) return initialImages;
      return next;
    });
    setI((x) => Math.min(x, images.length - 2));
  }

  const pIdx = (i - 1 + images.length) % images.length;
  const nIdx = (i + 1) % images.length;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 overflow-hidden">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Moments at ServeQ</div>
          <h2 className="font-display text-3xl sm:text-4xl mt-2">A taste of the atmosphere.</h2>
        </div>
        <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition">
          <Plus className="size-4" /> Add photo
        </button>
      </div>

      {/* 3D Carousel */}
      <div className="relative flex items-center justify-center h-[22rem] sm:h-[26rem] lg:h-[30rem]">
        <div className="relative w-full max-w-[85%] sm:max-w-[75%] lg:max-w-[55%]" style={{ perspective: "1200px" }}>
          <AnimatePresence mode="popLayout">
            {/* Left side image */}
            <motion.div
              key={`left-${i}`}
              initial={{ opacity: 0, x: -80, scale: 0.7 }}
              animate={{ opacity: 0.5, x: -60, scale: 0.75, rotateY: 18 }}
              exit={{ opacity: 0, x: -100, scale: 0.6 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-1/2 -translate-y-1/2 right-full mr-[-18%] hidden sm:block w-full cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              onClick={prev}
            >
              <div className="rounded-2xl overflow-hidden shadow-soft border border-border/30">
                <img src={images[pIdx]} alt="" className="w-full aspect-[4/3] object-cover" />
              </div>
              {images.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); handleRemove(pIdx); }}
                  className="absolute top-2 right-2 size-7 rounded-full bg-black/40 text-white grid place-items-center hover:bg-destructive transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </motion.div>

            {/* Center main image */}
            <motion.div
              key={`center-${i}`}
              initial={{ opacity: 0, scale: 0.85, rotateY: -6 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.85, rotateY: 6 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="relative z-10 w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="rounded-3xl overflow-hidden shadow-glass border border-border/40">
                <img src={images[i]} alt={`Gallery ${i + 1}`} className="w-full aspect-[4/3] object-cover" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-mocha/30 to-transparent rounded-b-3xl pointer-events-none" />
            </motion.div>

            {/* Right side image */}
            <motion.div
              key={`right-${i}`}
              initial={{ opacity: 0, x: 80, scale: 0.7 }}
              animate={{ opacity: 0.5, x: 60, scale: 0.75, rotateY: -18 }}
              exit={{ opacity: 0, x: 100, scale: 0.6 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-1/2 -translate-y-1/2 left-full ml-[-18%] hidden sm:block w-full cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              onClick={next}
            >
              <div className="rounded-2xl overflow-hidden shadow-soft border border-border/30">
                <img src={images[nIdx]} alt="" className="w-full aspect-[4/3] object-cover" />
              </div>
              {images.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); handleRemove(nIdx); }}
                  className="absolute top-2 right-2 size-7 rounded-full bg-black/40 text-white grid place-items-center hover:bg-destructive transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button onClick={prev} className="size-10 rounded-full bg-secondary hover:bg-accent grid place-items-center transition">
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex gap-1.5">
          {images.map((_, j) => (
            <button key={j} onClick={() => setI(j)} aria-label={`Go to image ${j + 1}`}
              className={`h-1.5 rounded-full transition-all ${j === i ? "w-8 bg-primary" : "w-1.5 bg-border"}`} />
          ))}
        </div>
        <button onClick={next} className="size-10 rounded-full bg-secondary hover:bg-accent grid place-items-center transition">
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />
        )}
      </AnimatePresence>
    </section>
  );
}

function UploadModal({ onClose, onUpload }: { onClose: () => void; onUpload: (file: File) => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm rounded-3xl bg-card border border-border/60 p-6 shadow-glass">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl">Add a photo</h3>
            <button onClick={onClose} className="size-8 rounded-full bg-secondary grid place-items-center"><X className="size-4" /></button>
          </div>
          <div className="mt-6">
            <label className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background/50 p-8 cursor-pointer hover:border-primary/50 transition">
              <Upload className="size-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to choose a photo</span>
              <span className="text-[10px] text-muted-foreground/60">PNG, JPG · max 5MB</span>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
            </label>
          </div>
        </div>
      </motion.div>
    </>
  );
}