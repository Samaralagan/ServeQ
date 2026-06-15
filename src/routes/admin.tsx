import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore, sessionTotals } from "@/lib/store";
import type { Category, MenuItem } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { Plus, Trash2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — ServeQ" }, { name: "description", content: "Full restaurant control: analytics, menu, tables, settings." }] }),
  component: AdminPage,
});

const CATS: Category[] = ["Food", "Drinks", "Desserts", "Specials"];

function AdminPage() {
  const navigate = useNavigate();
  const auth = useStore(s=>s.auth);
  useEffect(()=>{ if (!auth || auth.role !== "admin") navigate({ to: "/login" }); }, [auth, navigate]);

  useStore(s=>s._tick);
  const menu = useStore(s=>s.menu);
  const tables = useStore(s=>s.tables);
  const orders = useStore(s=>s.orders);
  const sessions = useStore(s=>s.sessions);
  const settings = useStore(s=>s.settings);
  const addMenuItem = useStore(s=>s.addMenuItem);
  const updateMenuItem = useStore(s=>s.updateMenuItem);
  const deleteMenuItem = useStore(s=>s.deleteMenuItem);
  const addTable = useStore(s=>s.addTable);
  const removeTable = useStore(s=>s.removeTable);
  const updateSettings = useStore(s=>s.updateSettings);

  const [tab, setTab] = useState<"overview"|"menu"|"tables"|"orders"|"settings">("overview");

  // Analytics
  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayOrders = orders.filter(o => o.createdAt >= today.getTime());
    const revenue = sessions.filter(s=>s.paid).reduce((a, s) => a + sessionTotals(s.id).total, 0);
    const popular: Record<string, number> = {};
    orders.forEach(o => o.items.forEach(i => { popular[i.name] = (popular[i.name] ?? 0) + i.qty; }));
    const topItems = Object.entries(popular).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,qty])=>({name, qty}));
    const hours: Record<number, number> = {};
    orders.forEach(o => { const h = new Date(o.createdAt).getHours(); hours[h] = (hours[h] ?? 0)+1; });
    const peak = Array.from({length:24},(_,h)=>({hour:`${h}:00`, orders: hours[h] ?? 0}));
    return { todayOrders: todayOrders.length, revenue, totalOrders: orders.length, topItems, peak };
  }, [orders, sessions]);

  return (
    <div className="min-h-screen">
      <AppHeader title="Admin Console" subtitle={`Signed in as ${auth?.name ?? ""}`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          {(["overview","menu","tables","orders","settings"] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition ${tab===t?"bg-primary text-primary-foreground":"bg-secondary hover:bg-accent"}`}>{t}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KPI label="Revenue (paid)" value={`$${stats.revenue.toFixed(2)}`} />
              <KPI label="Orders today" value={stats.todayOrders} />
              <KPI label="Total orders" value={stats.totalOrders} />
              <KPI label="Active tables" value={tables.filter(t=>t.status==="occupied").length} />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-3xl bg-card border border-border/60 p-5">
                <h3 className="font-display text-lg mb-2">Popular items</h3>
                <div className="h-72">
                  <ResponsiveContainer>
                    <BarChart data={stats.topItems}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="qty" fill="var(--primary)" radius={[8,8,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-3xl bg-card border border-border/60 p-5">
                <h3 className="font-display text-lg mb-2">Orders by hour</h3>
                <div className="h-72">
                  <ResponsiveContainer>
                    <LineChart data={stats.peak}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "menu" && <MenuEditor menu={menu} onAdd={addMenuItem} onUpdate={updateMenuItem} onDelete={deleteMenuItem} />}

        {tab === "tables" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl">Tables ({tables.length})</h2>
              <button onClick={addTable} className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm"><Plus className="size-4"/> Add table</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {tables.map(t => (
                <div key={t.id} className="rounded-2xl bg-card border border-border/60 p-4 text-center">
                  <div className="text-[10px] uppercase text-muted-foreground">Table</div>
                  <div className="font-display text-3xl">{t.number}</div>
                  <div className="text-xs capitalize text-muted-foreground mt-1">{t.status}</div>
                  <button onClick={()=>{ removeTable(t.id); toast.success("Table removed"); }} className="mt-3 inline-flex items-center gap-1 text-xs text-destructive"><Trash2 className="size-3"/> Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h2 className="font-display text-2xl mb-4">All orders</h2>
            <div className="rounded-3xl bg-card border border-border/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="text-left p-3">Order</th><th className="text-left p-3">Table</th><th className="text-left p-3">Items</th><th className="text-left p-3">Total</th><th className="text-left p-3">Status</th><th className="text-left p-3">Time</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const t = tables.find(x=>x.id===o.tableId);
                    const total = o.items.reduce((a,i)=>a+i.qty*i.price,0);
                    return (
                      <tr key={o.id} className="border-t border-border/60">
                        <td className="p-3 font-mono text-xs">#{o.id.slice(-6)}</td>
                        <td className="p-3">{t?.number ?? "—"}</td>
                        <td className="p-3">{o.items.map(i=>`${i.qty}× ${i.name}`).join(", ")}</td>
                        <td className="p-3">${total.toFixed(2)}</td>
                        <td className="p-3"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{o.status}</span></td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {orders.length===0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No orders yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="max-w-xl rounded-3xl bg-card border border-border/60 p-6 space-y-4">
            <h2 className="font-display text-2xl">System configuration</h2>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Restaurant name</span>
              <input value={settings.restaurantName} onChange={(e)=>updateSettings({restaurantName: e.target.value})}
                className="mt-1 w-full rounded-xl bg-background border border-border px-3 py-2.5"/>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Service charge %</span>
              <input type="number" value={settings.serviceChargePct} onChange={(e)=>updateSettings({serviceChargePct: Number(e.target.value)})}
                className="mt-1 w-full rounded-xl bg-background border border-border px-3 py-2.5"/>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Tax %</span>
              <input type="number" value={settings.taxPct} onChange={(e)=>updateSettings({taxPct: Number(e.target.value)})}
                className="mt-1 w-full rounded-xl bg-background border border-border px-3 py-2.5"/>
            </label>
            <button onClick={()=>toast.success("Settings saved")} className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm">Save</button>
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="rounded-3xl bg-card border border-border/60 p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-1 text-primary">{value}</div>
    </motion.div>
  );
}

function MenuEditor({ menu, onAdd, onUpdate, onDelete }: {
  menu: MenuItem[];
  onAdd: (i: Omit<MenuItem,"id">) => void;
  onUpdate: (id: string, patch: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<MenuItem>>({});
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<Omit<MenuItem,"id">>({ name: "", description: "", category: "Food", price: 0, emoji: "🍽️", available: true });

  function startEdit(m: MenuItem) { setEditing(m.id); setDraft(m); }
  function saveEdit() { if (editing) { onUpdate(editing, draft); setEditing(null); toast.success("Updated"); } }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl">Menu ({menu.length})</h2>
        <button onClick={()=>setAdding(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm"><Plus className="size-4"/> Add item</button>
      </div>

      {adding && (
        <div className="rounded-3xl bg-card border border-border/60 p-4 mb-4 space-y-3">
          <ImageUpload value={newItem.image} onChange={(image) => setNewItem({ ...newItem, image })} />
          <div className="grid sm:grid-cols-6 gap-2">
            <input placeholder="Emoji" value={newItem.emoji} onChange={(e)=>setNewItem({...newItem,emoji:e.target.value})} className="rounded-xl bg-background border border-border px-3 py-2 text-center" />
            <input placeholder="Name" value={newItem.name} onChange={(e)=>setNewItem({...newItem,name:e.target.value})} className="rounded-xl bg-background border border-border px-3 py-2 sm:col-span-2"/>
            <select value={newItem.category} onChange={(e)=>setNewItem({...newItem,category:e.target.value as Category})} className="rounded-xl bg-background border border-border px-3 py-2">
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Price" value={newItem.price} onChange={(e)=>setNewItem({...newItem,price:Number(e.target.value)})} className="rounded-xl bg-background border border-border px-3 py-2"/>
            <div className="flex gap-2">
              <button onClick={()=>{ if(!newItem.name) return toast.error("Name required"); onAdd(newItem); setAdding(false); setNewItem({name:"",description:"",category:"Food",price:0,emoji:"🍽️",available:true}); toast.success("Added"); }} className="flex-1 rounded-xl bg-primary text-primary-foreground px-3 py-2 text-sm inline-flex items-center justify-center gap-1"><Save className="size-4"/> Save</button>
              <button onClick={()=>setAdding(false)} className="rounded-xl bg-secondary px-3 py-2 text-sm"><X className="size-4"/></button>
            </div>
          </div>
          <input placeholder="Description" value={newItem.description} onChange={(e)=>setNewItem({...newItem,description:e.target.value})} className="w-full rounded-xl bg-background border border-border px-3 py-2"/>
        </div>
      )}

      <div className="grid gap-2">
        {menu.map(m => editing === m.id ? (
          <div key={m.id} className="rounded-2xl bg-card border border-primary p-4 space-y-3">
            <ImageUpload value={draft.image} onChange={(image) => setDraft({ ...draft, image })} />
            <div className="grid sm:grid-cols-6 gap-2">
              <input value={draft.emoji ?? ""} onChange={(e)=>setDraft({...draft,emoji:e.target.value})} className="rounded-xl bg-background border border-border px-3 py-2 text-center"/>
              <input value={draft.name ?? ""} onChange={(e)=>setDraft({...draft,name:e.target.value})} className="rounded-xl bg-background border border-border px-3 py-2 sm:col-span-2"/>
              <select value={draft.category ?? "Food"} onChange={(e)=>setDraft({...draft,category:e.target.value as Category})} className="rounded-xl bg-background border border-border px-3 py-2">
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
              <input type="number" value={draft.price ?? 0} onChange={(e)=>setDraft({...draft,price:Number(e.target.value)})} className="rounded-xl bg-background border border-border px-3 py-2"/>
              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex-1 rounded-xl bg-primary text-primary-foreground px-3 py-2 text-sm"><Save className="inline size-4"/></button>
                <button onClick={()=>setEditing(null)} className="rounded-xl bg-secondary px-3 py-2 text-sm"><X className="size-4"/></button>
              </div>
            </div>
            <input value={draft.description ?? ""} onChange={(e)=>setDraft({...draft,description:e.target.value})} className="w-full rounded-xl bg-background border border-border px-3 py-2"/>
          </div>
        ) : (
          <div key={m.id} className="rounded-2xl bg-card border border-border/60 p-4 flex items-center gap-3">
            <div className="size-12 rounded-xl bg-secondary grid place-items-center text-2xl overflow-hidden shrink-0">
              {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" /> : <span>{m.emoji}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{m.name}</div>
              <div className="text-xs text-muted-foreground truncate">{m.category} · {m.description}</div>
            </div>
            <div className="font-display text-primary">${m.price.toFixed(2)}</div>
            <button onClick={()=>startEdit(m)} className="size-9 rounded-full bg-secondary grid place-items-center"><Pencil className="size-4"/></button>
            <button onClick={()=>{ onDelete(m.id); toast.success("Deleted"); }} className="size-9 rounded-full bg-secondary grid place-items-center text-destructive"><Trash2 className="size-4"/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
