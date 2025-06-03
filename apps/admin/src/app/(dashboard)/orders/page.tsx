import { OrderList } from "@/components/orders/OrderList";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Orders | Admin Dashboard",
  description: "Manage customer orders",
};
/**
 * Orders Management Page Component
 *
 * Renders the admin dashboard page for managing customer orders.
 * Implements React Suspense for improved loading experience when
 * fetching order data through the OrderList component.
 *
 * @returns {JSX.Element} The rendered orders management page
 */
export default function OrdersPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading orders...</div>}>
        <OrderList />{" "}
      </Suspense>
    </main>
  );
}
