import { notFound } from "next/navigation";
import { client } from "@repo/db/client";
import { ProductDetail } from "@/components/products/ProductDetail";

// This enables dynamic rendering for each product page
export const dynamic = "force-dynamic";
export const revalidate = 0;
type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<any>;
};
/**
 * Product Detail Page Component
 *
 * Renders the admin interface for viewing a single product's details.
 * Fetches product data by ID and provides it to the ProductDetail component.
 * Handles invalid IDs, missing products, and errors with Next.js notFound() utility.
 * Uses dynamic rendering and zero revalidation for always fresh content.
 *
 * @param {Object} props - Component properties
 * @param {Promise<{id: string}>} props.params - URL parameters containing the product ID
 * @returns {Promise<JSX.Element>} The rendered product detail page
 */
export default async function ProductPage({ params }: Props) {
  try {
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
