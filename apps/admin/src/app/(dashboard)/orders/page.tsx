import { OrderList } from "@/components/orders/orderList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders | Admin Dashboard",
  description: "Manage customer orders",
};

export default function OrdersPage() {
  return (
    <main>
      <OrderList />
    </main>
  );
}
