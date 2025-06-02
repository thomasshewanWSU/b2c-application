import { ProductList } from "@/components/products/ProductList";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Products | Admin Dashboard",
  description: "Manage your product catalog",
};

export default function ProductsPage() {
  return (
    <main>
      <Suspense
        fallback={<div className="py-8 text-center">Loading products...</div>}
      >
        <ProductList />
      </Suspense>
    </main>
  );
}
