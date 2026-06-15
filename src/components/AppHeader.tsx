import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { LogOut } from "lucide-react";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const auth = useStore((s) => s.auth);
  const logout = useStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-30 glass grain border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="ServeQ logo" className="h-8 w-auto" />
        </Link>
        {subtitle && <div className="hidden sm:block text-sm text-muted-foreground">{subtitle}</div>}
        <div className="flex items-center gap-2">
          {auth ? (
            <>
              <span className="hidden sm:inline text-xs text-muted-foreground">{auth.name}</span>
              <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 bg-secondary hover:bg-accent transition">
                <LogOut className="size-3.5" /> Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="text-xs rounded-full px-3 py-1.5 bg-primary text-primary-foreground hover:opacity-90 transition">
              Staff login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}