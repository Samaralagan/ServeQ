import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { toast } from "sonner";
import { ChefHat, Receipt, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Staff login — ServeQ" }, { name: "description", content: "Sign in as Admin, Chef, or Receptionist." }] }),
  component: LoginPage,
});

const presets = [
  { email: "admin@zuno.com", password: "admin123", role: "Admin", icon: ShieldCheck, to: "/admin" },
  { email: "chef@zuno.com", password: "chef123", role: "Chef", icon: ChefHat, to: "/chef" },
  { email: "reception@zuno.com", password: "reception123", role: "Receptionist", icon: Receipt, to: "/reception" },
] as const;

function LoginPage() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = login(email, password);
    if (!u) return toast.error("Invalid credentials");
    toast.success(`Welcome, ${u.name}`);
    navigate({ to: u.role === "admin" ? "/admin" : u.role === "chef" ? "/chef" : "/reception" });
  }

  function quick(p: typeof presets[number]) {
    const u = login(p.email, p.password);
    if (u) { toast.success(`Signed in as ${p.role}`); navigate({ to: p.to }); }
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="Staff Access" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-2 gap-10 items-start">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl sm:text-5xl">Welcome back.</h1>
          <p className="mt-3 text-muted-foreground max-w-md">Sign in with your role credentials. Use the quick-fill cards for the demo.</p>

          <form onSubmit={submit} className="mt-8 glass grain rounded-3xl p-6 sm:p-8 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Email</span>
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl bg-background/70 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring/40" />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Password</span>
              <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl bg-background/70 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring/40" />
            </label>
            <button type="submit" className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium hover:opacity-90 transition shadow-soft">
              Sign in
            </button>
          </form>
        </motion.div>

        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Demo accounts · click to enter</div>
          {presets.map((p, i) => (
            <motion.button key={p.email} onClick={() => quick(p)}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="w-full text-left group rounded-2xl bg-card border border-border/60 p-5 flex items-center gap-4 hover:shadow-soft hover:-translate-y-0.5 transition">
              <div className="size-12 rounded-2xl bg-secondary grid place-items-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                <p.icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="font-display text-lg">{p.role}</div>
                <div className="text-xs text-muted-foreground">{p.email} · {p.password}</div>
              </div>
              <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition">Enter →</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
