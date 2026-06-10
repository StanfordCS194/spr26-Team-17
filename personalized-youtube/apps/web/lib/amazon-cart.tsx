'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { formatUsd, parseAmazonPriceUsd } from '@/lib/amazon/image-utils';

export type AmazonCartItem = {
  asin: string;
  title: string;
  price: string;
  thumbnail: string;
  qty: number;
};

export type AmazonScreen = 'browse' | 'cart' | 'checkout' | 'confirmation';

const STORAGE_KEY = 'showcase-amazon-cart-v1';

type AmazonCartValue = {
  items: AmazonCartItem[];
  screen: AmazonScreen;
  lastOrderId: string | null;
  cartCount: number;
  subtotal: number;
  subtotalLabel: string;
  addedBanner: string | null;
  addToCart: (item: Omit<AmazonCartItem, 'qty'>, qty?: number) => void;
  buyNow: (item: Omit<AmazonCartItem, 'qty'>, qty?: number) => void;
  updateQty: (asin: string, qty: number) => void;
  removeItem: (asin: string) => void;
  goToCart: () => void;
  goToCheckout: () => void;
  goToBrowse: () => void;
  placeOrder: () => string;
  clearAddedBanner: () => void;
};

const AmazonCartContext = createContext<AmazonCartValue | null>(null);

function loadItems(): AmazonCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AmazonCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(items: AmazonCartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function makeOrderId(): string {
  const a = Math.floor(100 + Math.random() * 900);
  const b = Math.floor(1_000_000 + Math.random() * 9_000_000);
  const c = Math.floor(1_000_000 + Math.random() * 9_000_000);
  return `${a}-${b}-${c}`;
}

export function AmazonCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AmazonCartItem[]>([]);
  const [screen, setScreen] = useState<AmazonScreen>('browse');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [addedBanner, setAddedBanner] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadItems());
  }, []);

  const persist = useCallback((next: AmazonCartItem[]) => {
    setItems(next);
    saveItems(next);
  }, []);

  const addToCart = useCallback(
    (item: Omit<AmazonCartItem, 'qty'>, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.asin === item.asin);
        let next: AmazonCartItem[];
        if (existing) {
          next = prev.map((i) =>
            i.asin === item.asin ? { ...i, qty: i.qty + qty, title: item.title, price: item.price, thumbnail: item.thumbnail } : i,
          );
        } else {
          next = [...prev, { ...item, qty }];
        }
        saveItems(next);
        return next;
      });
      setAddedBanner(item.title);
    },
    [],
  );

  const buyNow = useCallback(
    (item: Omit<AmazonCartItem, 'qty'>, qty = 1) => {
      addToCart(item, qty);
      setScreen('checkout');
    },
    [addToCart],
  );

  const updateQty = useCallback((asin: string, qty: number) => {
    setItems((prev) => {
      const next = qty < 1 ? prev.filter((i) => i.asin !== asin) : prev.map((i) => (i.asin === asin ? { ...i, qty } : i));
      saveItems(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((asin: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.asin !== asin);
      saveItems(next);
      return next;
    });
  }, []);

  const cartCount = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + parseAmazonPriceUsd(i.price) * i.qty, 0),
    [items],
  );
  const subtotalLabel = formatUsd(subtotal);

  const value: AmazonCartValue = {
    items,
    screen,
    lastOrderId,
    cartCount,
    subtotal,
    subtotalLabel,
    addedBanner,
    addToCart,
    buyNow,
    updateQty,
    removeItem,
    goToCart: () => setScreen('cart'),
    goToCheckout: () => setScreen('checkout'),
    goToBrowse: () => setScreen('browse'),
    placeOrder: () => {
      const id = makeOrderId();
      setLastOrderId(id);
      persist([]);
      setScreen('confirmation');
      return id;
    },
    clearAddedBanner: () => setAddedBanner(null),
  };

  return <AmazonCartContext.Provider value={value}>{children}</AmazonCartContext.Provider>;
}

export function useAmazonCart(): AmazonCartValue {
  const ctx = useContext(AmazonCartContext);
  if (!ctx) {
    throw new Error('useAmazonCart must be used within AmazonCartProvider');
  }
  return ctx;
}

export function useAmazonCartOptional(): AmazonCartValue | null {
  return useContext(AmazonCartContext);
}
