import { create } from "zustand";

interface LanguageState {
  lang: "en" | "bn";
  setLang: (lang: "en" | "bn") => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: (typeof document !== "undefined" && (document.cookie.match(/lang=([^;]+)/)?.[1] as "en" | "bn")) || "bn",
  setLang: (lang) => {
    document.cookie = `lang=${lang};path=/;max-age=31536000`;
    document.documentElement.lang = lang;
    set({ lang });
  },
}));

export const useLang = () => useLanguageStore((s) => s.lang);

interface CartItem {
  productId: number;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
  productType?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("cart") || "[]") : [],
  addItem: (item) => {
    const items = get().items;
    const existing = items.find((i) => i.productId === item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push(item);
    }
    set({ items: [...items] });
    localStorage.setItem("cart", JSON.stringify(items));
  },
  removeItem: (productId) => {
    const items = get().items.filter((i) => i.productId !== productId);
    set({ items });
    localStorage.setItem("cart", JSON.stringify(items));
  },
  updateQuantity: (productId, quantity) => {
    const items = get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    set({ items });
    localStorage.setItem("cart", JSON.stringify(items));
  },
  clearCart: () => {
    set({ items: [] });
    localStorage.removeItem("cart");
  },
  total: () => {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },
}));

export const useCartItems = () => useCartStore((s) => s.items);
export const useCartTotal = () => useCartStore((s) => s.total());

interface TestModeState {
  isActive: boolean;
  toggle: () => void;
}

export const useTestModeStore = create<TestModeState>((set) => ({
  isActive: false,
  toggle: () => set((state) => ({ isActive: !state.isActive })),
}));

export const useTestMode = () => useTestModeStore((s) => s.isActive);
