import { CartPage } from "@/components/cart/CartPage";

export const metadata = {
  title: "Shop Products",
  description: "Browse our collection of products",
};

export default async function ProductsPage({}: {}) {
  return (
    <div>
      <CartPage />
    </div>
  );
}
