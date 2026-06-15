export type Role = "admin" | "chef" | "receptionist";

export type Category = "Food" | "Drinks" | "Desserts" | "Specials";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  emoji: string;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  instructions?: string;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "served";

export interface Order {
  id: string;
  tableId: string;
  sessionId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: number;
  customer: { name: string; phone: string; email: string };
}

export interface Table {
  id: string;
  number: number;
  status: "available" | "occupied" | "reserved";
  sessionId?: string;
}

export interface Session {
  id: string;
  tableId: string;
  paid: boolean;
  feedback?: { rating: number; comment: string };
  createdAt: number;
}

export interface Settings {
  serviceChargePct: number;
  taxPct: number;
  restaurantName: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  image?: string;
  createdAt: number;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  createdAt: number;
}
