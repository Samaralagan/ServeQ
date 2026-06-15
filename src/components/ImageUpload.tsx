import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export function ImageUpload({ value, onChange, className = "" }: { value?: string; onChange: (url: string | undefined) => void; className?: string }) {
  const ref = useRef<HTMLInputElement>(null);

  function pick(file: File) {
    if (file.size > 3 * 1024 * 1024) return toast.error("Image must be under 3MB");
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.onerror = () => toast.error("Could not read image");
    reader.readAsDataURL(file);
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="size-16 rounded-xl bg-secondary overflow-hidden grid place-items-center border border-border/60 shrink-0">
        {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <Upload className="size-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 flex flex-wrap gap-2">
        <button type="button" onClick={() => ref.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-secondary hover:bg-accent px-3 py-2 text-xs">
          <Upload className="size-3.5" /> {value ? "Replace" : "Upload image"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(undefined)}
            className="inline-flex items-center gap-1 rounded-xl bg-secondary hover:bg-accent px-3 py-2 text-xs text-destructive">
            <X className="size-3.5" /> Remove
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ""; }} />
      </div>
    </div>
  );
}
