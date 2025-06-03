import { ProductsContainer } from "@/components/products/ProductsContainer";
import { Suspense } from "react";
import { LoadingSpinner } from "@repo/utils";

export const metadata = {
  title: "Shop Products",
  description: "Browse our collection of products",
};

// This page is used to display products in the shop.
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  console.log("ProductsPage searchParams");
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="sr-only">Products</h1>
      <Suspense
        fallback={<LoadingSpinner size="large" message="Loading products..." />}
      >
        <ProductsContainer initialSearchParams={await searchParams} />
      </Suspense>
    </div>
  );
}
