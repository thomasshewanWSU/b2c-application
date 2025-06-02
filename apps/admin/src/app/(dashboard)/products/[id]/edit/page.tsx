import { client } from "@repo/db/client";
import { ProductForm } from "@/components/products/ProductForm";
import { notFound } from "next/navigation";
/**
 * Edit Product Page Component
 *
 * Renders the admin interface for editing an existing product.
 * Fetches product data by ID and provides it to the ProductForm component.
 * Handles invalid IDs and missing products with Next.js notFound() utility.
 *
 * @param {Object} props - Component properties
 * @param {Promise<{id: string}>} props.params - URL parameters containing the product ID
 * @returns {Promise<JSX.Element>} The rendered product edit form page
 */
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
