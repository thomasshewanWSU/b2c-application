import { useMemo } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
};

type CartCalculationProps = {
  items: CartItem[];
  children: (props: {
    subtotal: number;
    shippingCost: number;
    total: number;
  }) => React.ReactNode;
};

/**
 * Cart Calculation Component
 *
 * Calculates shopping cart totals including subtotal, shipping cost, and final total.
 * Implements a render prop pattern to provide calculated values to child components.
 * Applies business rules such as free shipping for orders over $100.
 * Uses React useMemo for performance optimization of calculations.
 *
 * @param {Object} props - Component properties
 * @param {CartItem[]} props.items - Array of cart items with quantity and price information
 * @param {Function} props.children - Render prop function that receives calculated values
 * @returns {React.ReactNode} The rendered output from the children function
 */
export function CartCalculation({ items, children }: CartCalculationProps) {
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const shippingCost = useMemo(() => (subtotal > 100 ? 0 : 10), [subtotal]);

  const total = useMemo(
    () => subtotal + shippingCost,
    [subtotal, shippingCost],
  );

  return children({
    subtotal,
    shippingCost,
    total,
  });
}
