import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "../types";
import * as api from "../api";

const CART_KEY = "ss_cart_id";

function getCartId(): string {
  let id = localStorage.getItem(CART_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CART_KEY, id);
  }
  return id;
}

interface CartCtx {
  cartId: string;
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (product: Product, quantity?: number) => Promise<void>;
  updateQty: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string>(getCartId);
  const [items, setItems] = useState<CartItem[]>([]);

  const adoptCart = useCallback((adopted: string) => {
    if (adopted !== cartId) {
      localStorage.setItem(CART_KEY, adopted);
      setCartId(adopted);
    }
  }, [cartId]);

  // Make sure a server-side cart exists for the stored cartId, adopting the
  // returned cartId if the server generated a fresh one.
  const ensureCart = useCallback(async (): Promise<string> => {
    try {
      const existing = await api.getCart(cartId);
      return existing.cartId;
    } catch {
      const created = await api.createCart();
      adoptCart(created.cartId);
      return created.cartId;
    }
  }, [cartId, adoptCart]);

  const reload = useCallback(async () => {
    const id = await ensureCart();
    try {
      const cart = await api.getCart(id);
      setItems(cart.items);
    } catch {
      setItems([]);
    }
  }, [ensureCart]);

  useEffect(() => {
    let cancelled = false;
    ensureCart()
      .then((id) => api.getCart(id))
      .then((cart) => !cancelled && setItems(cart.items))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [ensureCart]);

  const add = useCallback(
    async (product: Product, quantity = 1) => {
      const id = await ensureCart();
      const cart = await api.addCartItem(id, product._id, quantity);
      setItems(cart.items);
    },
    [ensureCart]
  );

  const updateQty = useCallback(
    async (productId: string, quantity: number) => {
      const id = await ensureCart();
      const cart = await api.updateCartItem(id, productId, quantity);
      setItems(cart.items);
    },
    [ensureCart]
  );

  const remove = useCallback(
    async (productId: string) => {
      const id = await ensureCart();
      const cart = await api.removeCartItem(id, productId);
      setItems(cart.items);
    },
    [ensureCart]
  );

  const clear = useCallback(async () => {
    const id = await ensureCart();
    const cart = await api.clearCart(id);
    setItems(cart.items);
  }, [ensureCart]);

  const count = useMemo(
    () => items.reduce((n, i) => n + i.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ cartId, items, count, subtotal, add, updateQty, remove, clear, reload }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
