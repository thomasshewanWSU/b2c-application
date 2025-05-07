import { ProductList } from "@/components/products/productList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Admin Dashboard",
  description: "Manage your product catalog",
};

export default function ProductsPage() {
  return (
    <main>
      <ProductList />
    </main>
  );
}
