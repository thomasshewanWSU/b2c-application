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
