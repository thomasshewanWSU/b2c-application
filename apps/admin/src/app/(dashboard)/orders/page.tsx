import { OrderList } from "@/components/orders/orderList";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Orders | Admin Dashboard",
  description: "Manage customer orders",
};

export default function OrdersPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading orders...</div>}>
        <OrderList />{" "}
      </Suspense>
    </main>
  );
}
