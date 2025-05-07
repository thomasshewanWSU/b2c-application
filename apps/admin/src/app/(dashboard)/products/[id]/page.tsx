import { notFound } from "next/navigation";
import { client } from "@repo/db/client";
import { ProductDetail } from "@/components/products/productDetail";

// This enables dynamic rendering for each product page
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getProduct(id: string) {
  try {
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return null;
    }

    const product = await client.db.product.findUnique({
      where: { id: productId },
    });

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
