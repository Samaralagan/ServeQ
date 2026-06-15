import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MenuItem, Order, OrderItem, OrderStatus, Session, Table, Settings, Role, Testimonial, Reservation } from "./types";
import { seedMenu, seedTablesWithSessions, seedSettings, seedOrders, seedSessions, seedTestimonials } from "./seed";

interface AuthUser {
  email: string;
  role: Role;
  name: string;
}

interface State {
  menu: MenuItem[];
  tables: Table[];
  orders: Order[];
  sessions: Session[];
  settings: Settings;
  testimonials: Testimonial[];
  reservations: Reservation[];
  auth: AuthUser | null;
  _tick: number;

  toggleAvailability: (id: string) => void;
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, patch: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  addTable: () => void;
  removeTable: (id: string) => void;
  setTableStatus: (id: string, status: Table["status"]) => void;

  startSession: (tableId: string) => string;
  placeOrder: (data: { tableId: string; sessionId: string; items: OrderItem[]; customer: Order["customer"] }) => Order;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  markPaid: (sessionId: string) => void;
  submitFeedback: (sessionId: string, rating: number, comment: string) => void;

  addTestimonial: (t: Omit<Testimonial, "id" | "createdAt">) => void;
  addReservation: (r: Omit<Reservation, "id" | "createdAt">) => Reservation;

  updateSettings: (patch: Partial<Settings>) => void;

  login: (email: string, password: string) => AuthUser | null;
  logout: () => void;
}

const DUMMY = [
  { email: "admin@zuno.com", password: "admin123", role: "admin" as Role, name: "Avery (Admin)" },
  { email: "chef@zuno.com", password: "chef123", role: "chef" as Role, name: "Chef Marco" },
  { email: "reception@zuno.com", password: "reception123", role: "receptionist" as Role, name: "Reception" },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      menu: seedMenu,
      tables: seedTablesWithSessions,
      orders: seedOrders,
      sessions: seedSessions,
      settings: seedSettings,
      testimonials: seedTestimonials,
      reservations: [],
      auth: null,
      _tick: 0,

      toggleAvailability: (id) =>
        set((s) => ({ menu: s.menu.map((m) => (m.id === id ? { ...m, available: !m.available } : m)), _tick: s._tick + 1 })),
      addMenuItem: (item) => set((s) => ({ menu: [...s.menu, { ...item, id: uid() }], _tick: s._tick + 1 })),
      updateMenuItem: (id, patch) =>
        set((s) => ({ menu: s.menu.map((m) => (m.id === id ? { ...m, ...patch } : m)), _tick: s._tick + 1 })),
      deleteMenuItem: (id) => set((s) => ({ menu: s.menu.filter((m) => m.id !== id), _tick: s._tick + 1 })),

      addTable: () =>
        set((s) => {
          const num = (s.tables.at(-1)?.number ?? 0) + 1;
          return { tables: [...s.tables, { id: `t${num}-${uid()}`, number: num, status: "available" }], _tick: s._tick + 1 };
        }),
      removeTable: (id) => set((s) => ({ tables: s.tables.filter((t) => t.id !== id), _tick: s._tick + 1 })),
      setTableStatus: (id, status) =>
        set((s) => ({ tables: s.tables.map((t) => (t.id === id ? { ...t, status } : t)), _tick: s._tick + 1 })),

      startSession: (tableId) => {
        const existing = get().tables.find((t) => t.id === tableId)?.sessionId;
        if (existing) {
          const sess = get().sessions.find((s) => s.id === existing);
          if (sess && !sess.paid) return existing;
        }
        const id = `s_${uid()}`;
        set((s) => ({
          sessions: [...s.sessions, { id, tableId, paid: false, createdAt: Date.now() }],
          tables: s.tables.map((t) => (t.id === tableId ? { ...t, status: "occupied", sessionId: id } : t)),
          _tick: s._tick + 1,
        }));
        return id;
      },

      placeOrder: ({ tableId, sessionId, items, customer }) => {
        const order: Order = { id: `o_${uid()}`, tableId, sessionId, items, status: "pending", createdAt: Date.now(), customer };
        set((s) => ({ orders: [order, ...s.orders], _tick: s._tick + 1 }));
        return order;
      },

      setOrderStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)), _tick: s._tick + 1 })),

      markPaid: (sessionId) =>
        set((s) => ({
          sessions: s.sessions.map((x) => (x.id === sessionId ? { ...x, paid: true } : x)),
          tables: s.tables.map((t) => (t.sessionId === sessionId ? { ...t, status: "available", sessionId: undefined } : t)),
          _tick: s._tick + 1,
        })),

      submitFeedback: (sessionId, rating, comment) =>
        set((s) => ({
          sessions: s.sessions.map((x) => (x.id === sessionId ? { ...x, feedback: { rating, comment } } : x)),
          _tick: s._tick + 1,
        })),

      addTestimonial: (t) =>
        set((s) => ({ testimonials: [{ ...t, id: `tst_${uid()}`, createdAt: Date.now() }, ...s.testimonials], _tick: s._tick + 1 })),

      addReservation: (r) => {
        const reservation: Reservation = { ...r, id: `r_${uid()}`, createdAt: Date.now() };
        set((s) => ({ reservations: [reservation, ...s.reservations], _tick: s._tick + 1 }));
        return reservation;
      },

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch }, _tick: s._tick + 1 })),

      login: (email, password) => {
        const u = DUMMY.find((d) => d.email === email && d.password === password);
        if (!u) return null;
        const auth = { email: u.email, role: u.role, name: u.name };
        set({ auth });
        return auth;
      },
      logout: () => set({ auth: null }),
    }),
    {
      name: "serveq-store",
      version: 3,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as never))),
      partialize: (s) => ({
        menu: s.menu, tables: s.tables, orders: s.orders, sessions: s.sessions, settings: s.settings,
        testimonials: s.testimonials, reservations: s.reservations, auth: s.auth,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "serveq-store") useStore.persist.rehydrate();
  });
}

export function sessionTotals(sessionId: string) {
  const { orders, settings } = useStore.getState();
  const sOrders = orders.filter((o) => o.sessionId === sessionId);
  const subtotal = sOrders.reduce((acc, o) => acc + o.items.reduce((a, i) => a + i.price * i.qty, 0), 0);
  const serviceCharge = (subtotal * settings.serviceChargePct) / 100;
  const tax = (subtotal * settings.taxPct) / 100;
  const total = subtotal + serviceCharge + tax;
  return { subtotal, serviceCharge, tax, total, orders: sOrders };
}
