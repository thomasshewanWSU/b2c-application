import { notFound } from "next/navigation";
import { client } from "@repo/db/client";
import { ProductDetailView } from "@repo/utils";
import { QuantityControls } from "@/components/cart/QuantityControls";

// This enables dynamic rendering for each product page
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const product = await client.db.product.findFirst({
      where: { urlId: id },
      include: { reviews: true },
    });

    if (!product) notFound();

    let averageRating = 0;
    let reviewCount = 0;

    if (product.reviews?.length > 0) {
      reviewCount = product.reviews.length;
      averageRating =
        product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviewCount;
    }

    const productWithRating = {
      ...product,
      rating: averageRating,
      reviewCount,
      reviews: product.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title || undefined,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
    };

    return (
      <ProductDetailView
        product={productWithRating}
        actions={
          <QuantityControls
            productId={product.id}
            stock={product.stock}
            showQuantitySelector={true}
            defaultQuantity={1}
          />
        }
        showTabs={true}
        showReviews={true}
      />
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}
