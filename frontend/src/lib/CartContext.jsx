import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabase';

export const CartContext = createContext({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalAmount: 0,
});

const MAX_ITEM_QUANTITY = 20;
const LEGACY_CART_KEY = 'bm_cart';

const cartKeyFor = (userId) => (userId ? `bm_cart_${userId}` : 'bm_cart_guest');

const loadCart = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Failed to read cart from localStorage', error);
    return [];
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const storageKeyRef = useRef(null);

  useEffect(() => {
    // migrate the old single shared cart into the guest cart, once
    try {
      const legacyCart = localStorage.getItem(LEGACY_CART_KEY);
      if (legacyCart) {
        if (!localStorage.getItem(cartKeyFor(null))) {
          localStorage.setItem(cartKeyFor(null), legacyCart);
        }
        localStorage.removeItem(LEGACY_CART_KEY);
      }
    } catch (error) {
      console.warn('Failed to migrate legacy cart', error);
    }

    const loadCartForSession = (session) => {
      const key = cartKeyFor(session?.user?.id ?? null);
      storageKeyRef.current = key;
      setCartItems(loadCart(key));
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadCartForSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadCartForSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const key = storageKeyRef.current;
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(cartItems));
    } catch (error) {
      console.warn('Failed to save cart to localStorage', error);
    }
  }, [cartItems]);

  const addToCart = (product) => {
    const available = product.stock ?? product.quantity ?? product.available ?? Infinity;
    if (available <= 0) {
      window.alert('ขออภัย สินค้าหมดสต็อก');
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newQty = Math.min(MAX_ITEM_QUANTITY, existing.quantity + 1, available);
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: newQty,
              }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((prev) => {
      const target = prev.find((p) => p.id === productId);
      const available = target ? (target.stock ?? target.quantity ?? target.available ?? Infinity) : Infinity;

      if (quantity <= 0) {
        return prev.filter((item) => item.id !== productId);
      }

      return prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(MAX_ITEM_QUANTITY, Math.min(quantity, available)) }
          : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
    0
  );

  const value = useMemo(
    () => ({ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount }),
    [cartItems, totalItems, totalAmount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
