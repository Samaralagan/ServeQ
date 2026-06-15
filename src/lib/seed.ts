import type { MenuItem, Table, Settings, Testimonial } from "./types";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

export const seedMenu: MenuItem[] = [
  { id: "m1", name: "Truffle Mushroom Risotto", description: "Creamy arborio, wild mushrooms, shaved truffle.", category: "Food", price: 18.5, emoji: "🍚", available: true, image: img("photo-1476124369491-e7addf5db371") },
  { id: "m2", name: "Wagyu Smash Burger", description: "Double patty, aged cheddar, brioche.", category: "Food", price: 16.0, emoji: "🍔", available: true, image: img("photo-1568901346375-23c9450c58cd") },
  { id: "m3", name: "Saffron Seafood Paella", description: "Prawns, mussels, chorizo, bomba rice.", category: "Specials", price: 24.0, emoji: "🥘", available: true, image: img("photo-1534080564583-6be75777b70a") },
  { id: "m4", name: "Heirloom Tomato Salad", description: "Burrata, basil oil, aged balsamic.", category: "Food", price: 12.0, emoji: "🥗", available: true, image: img("photo-1546069901-ba9599a7e63c") },
  { id: "m5", name: "Crispy Duck Confit", description: "Slow-cooked leg, cherry jus, pommes.", category: "Specials", price: 26.0, emoji: "🦆", available: true, image: img("photo-1544025162-d76694265947") },
  { id: "m6", name: "Margherita Sourdough", description: "San Marzano, fior di latte, basil.", category: "Food", price: 14.0, emoji: "🍕", available: true, image: img("photo-1574071318508-1cdbab80d002") },
  { id: "m7", name: "Espresso Martini", description: "Vodka, fresh espresso, kahlua.", category: "Drinks", price: 11.0, emoji: "🍸", available: true, image: img("photo-1551024709-8f23befc6f87") },
  { id: "m8", name: "Pressed Cold Brew", description: "48-hour slow extraction, single origin.", category: "Drinks", price: 5.5, emoji: "☕", available: true, image: img("photo-1461023058943-07fcbe16d735") },
  { id: "m9", name: "Hibiscus Spritz", description: "Hibiscus, prosecco, soda, citrus peel.", category: "Drinks", price: 9.5, emoji: "🥂", available: true, image: img("photo-1514362545857-3bc16c4c7d1b") },
  { id: "m10", name: "Mango Lassi", description: "Alphonso mango, yogurt, cardamom.", category: "Drinks", price: 6.0, emoji: "🥭", available: true, image: img("photo-1546173159-315724a31696") },
  { id: "m11", name: "Burnt Basque Cheesecake", description: "Caramelized top, vanilla bean.", category: "Desserts", price: 9.0, emoji: "🍰", available: true, image: img("photo-1567171466295-4afa63d45416") },
  { id: "m12", name: "Dark Chocolate Fondant", description: "Molten center, salted caramel ice cream.", category: "Desserts", price: 10.0, emoji: "🍫", available: true, image: img("photo-1606313564200-e75d5e30476c") },
  { id: "m13", name: "Pistachio Tiramisu", description: "Mascarpone, espresso, pistachio crumb.", category: "Desserts", price: 9.5, emoji: "🍮", available: true, image: img("photo-1571877227200-a0d98ea607e9") },
];

export const seedTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`,
  number: i + 1,
  status: "available" as const,
}));

export const seedSettings: Settings = {
  serviceChargePct: 10,
  taxPct: 5,
  restaurantName: "ServeQ",
};

const now = Date.now();
export const seedSessions = [
  { id: "s_demo1", tableId: "t3", paid: false, createdAt: now - 18 * 60_000 },
  { id: "s_demo2", tableId: "t7", paid: false, createdAt: now - 9 * 60_000 },
  { id: "s_demo3", tableId: "t10", paid: false, createdAt: now - 3 * 60_000 },
];

export const seedOrders = [
  { id: "o_demo1", tableId: "t3", sessionId: "s_demo1", status: "preparing" as const, createdAt: now - 12 * 60_000,
    customer: { name: "Liam Park", phone: "+1 555 0142", email: "liam@example.com" },
    items: [
      { menuItemId: "m1", name: "Truffle Mushroom Risotto", price: 18.5, qty: 1, instructions: "No truffle oil" },
      { menuItemId: "m9", name: "Hibiscus Spritz", price: 9.5, qty: 2 },
    ] },
  { id: "o_demo2", tableId: "t7", sessionId: "s_demo2", status: "pending" as const, createdAt: now - 4 * 60_000,
    customer: { name: "Noor Ahmed", phone: "+1 555 0188", email: "noor@example.com" },
    items: [
      { menuItemId: "m2", name: "Wagyu Smash Burger", price: 16, qty: 2 },
      { menuItemId: "m8", name: "Pressed Cold Brew", price: 5.5, qty: 1 },
    ] },
  { id: "o_demo3", tableId: "t10", sessionId: "s_demo3", status: "ready" as const, createdAt: now - 2 * 60_000,
    customer: { name: "Sofia Reyes", phone: "+1 555 0177", email: "sofia@example.com" },
    items: [
      { menuItemId: "m5", name: "Crispy Duck Confit", price: 26, qty: 1 },
      { menuItemId: "m12", name: "Dark Chocolate Fondant", price: 10, qty: 1 },
    ] },
  { id: "o_demo4", tableId: "t3", sessionId: "s_demo1", status: "served" as const, createdAt: now - 22 * 60_000,
    customer: { name: "Liam Park", phone: "+1 555 0142", email: "liam@example.com" },
    items: [{ menuItemId: "m4", name: "Heirloom Tomato Salad", price: 12, qty: 1 }] },
];

export const seedTablesWithSessions: Table[] = seedTables.map((t) => {
  const s = seedSessions.find((x) => x.tableId === t.id);
  return s ? { ...t, status: "occupied" as const, sessionId: s.id } : t;
});

export const seedTestimonials: Testimonial[] = [
  { id: "tst1", name: "Amelia Carter", rating: 5, createdAt: now - 86400_000 * 4,
    comment: "Scanned, ordered, and the duck confit hit the table in 12 minutes. Game changer for date nights." },
  { id: "tst2", name: "Daniel Okafor", rating: 5, createdAt: now - 86400_000 * 2,
    comment: "No more flagging down a waiter. The kitchen knew about my allergy from the order note. Flawless." },
  { id: "tst3", name: "Priya Menon", rating: 4, createdAt: now - 86400_000,
    comment: "Bill split between four phones in seconds. The risotto deserves the hype." },
  { id: "tst4", name: "Marco Bianchi", rating: 5, createdAt: now - 3600_000 * 8,
    comment: "Watching the order status flip from preparing to ready is oddly satisfying. Tiramisu was perfect." },
];
