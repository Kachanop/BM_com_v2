import { createContext, useEffect, useMemo, useState } from 'react';

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

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('bm_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.warn('Failed to read cart from localStorage', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bm_cart', JSON.stringify(cartItems));
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
