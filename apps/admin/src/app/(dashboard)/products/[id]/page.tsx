import { notFound } from "next/navigation";
import { client } from "@repo/db/client";
import { ProductDetail } from "@/components/products/productDetail";

// This enables dynamic rendering for each product page
export const dynamic = "force-dynamic";
export const revalidate = 0;
type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<any>;
};

export default async function ProductPage({ params }: Props) {
  try {
    // Await the params since they're now a Promise
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id, 10);

    if (isNaN(productId)) {
      notFound();
    }

    const product = await client.db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      notFound();
    }

    return <ProductDetail product={product} />;
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}
