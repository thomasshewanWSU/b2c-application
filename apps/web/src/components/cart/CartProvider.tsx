"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

type CartItem = {
  id: number;
  name?: string;
  price?: number;
  quantity: number;
  image?: string;
  slug?: string;
  stock?: number;
};

type CartContextType = {
  refreshCart: () => void;
  cartVersion: number;
  cartItems: CartItem[];
  updateCartItemLocally: (id: number, quantity: number) => void;
  removeCartItemLocally: (id: number) => void;
  cartCount: number;
  isCartEmpty: boolean;
};

const CartContext = createContext<CartContextType>({
  refreshCart: () => {},
  cartVersion: 0,
  cartItems: [],
  updateCartItemLocally: () => {},
  removeCartItemLocally: () => {},
  cartCount: 0,
  isCartEmpty: true,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartVersion, setCartVersion] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isCartEmpty, setIsCartEmpty] = useState(true);

  // Calculate cart count whenever cartItems change
  useEffect(() => {
    const newCount = cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    setCartCount(newCount);
    setIsCartEmpty(cartItems.length === 0);
  }, [cartItems]);

  // Fetch cart data when cartVersion changes
  useEffect(() => {
    async function fetchCart() {
      try {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    }

    fetchCart();
  }, [cartVersion]);

  const refreshCart = useCallback(() => {
    setCartVersion((prev) => prev + 1);
  }, []);

  // Method to update cart item locally without API call
  const updateCartItemLocally = useCallback((id: number, quantity: number) => {
    setCartItems((prev) => {
      const itemExists = prev.some((item) => item.id === id);

      if (itemExists) {
        // Update existing item
        return prev.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        );
      } else {
        // Add new item with minimal data
        return [...prev, { id, quantity }];
      }
    });
  }, []);

  // Method to remove cart item locally without API call
  const removeCartItemLocally = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <CartContext.Provider
      value={{
        refreshCart,
        cartVersion,
        cartItems,
        updateCartItemLocally,
        removeCartItemLocally,
        cartCount,
        isCartEmpty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  return useContext(CartContext);
}
