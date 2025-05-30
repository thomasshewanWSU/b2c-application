import { client } from "@repo/db/client";
import { ProductForm } from "@/components/products/productForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const productId = parseInt((await params).id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  // Fetch the product data
  const product = await client.db.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="py-6">
      <ProductForm initialProduct={product} mode="edit" />
    </div>
  );
}
