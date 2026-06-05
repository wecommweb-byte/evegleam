'use client';
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { CartItem } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, variationId?: number) => void;
  updateQuantity: (id: number, quantity: number, variationId?: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function safeGetLocal(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSetLocal(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* blocked in private mode */ }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const hasLoaded = useRef(false); // prevent saving before first load completes

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = safeGetLocal('evegleam_cart');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { /* corrupt data, ignore */ }
    }
    hasLoaded.current = true;
  }, []);

  // Save cart to localStorage whenever items change (but only after initial load)
  useEffect(() => {
    if (!hasLoaded.current) return;
    safeSetLocal('evegleam_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.variationId === item.variationId);
      if (existing) {
        return prev.map(i => i.id === item.id && i.variationId === item.variationId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
        );
      }
      return [...prev, item];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: number, variationId?: number) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.variationId === variationId)));
  };

  const updateQuantity = (id: number, quantity: number, variationId?: number) => {
    if (quantity < 1) { removeFromCart(id, variationId); return; }
    setItems(prev => prev.map(i =>
      i.id === id && i.variationId === variationId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      total, itemCount, isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
