import { notFound } from "next/navigation";
import { client } from "@repo/db/client";
import { ProductDetailView } from "@/components/products/ProductDetailView";

// Define the page props with id parameter
interface PageProps {
  params: {
    id: string;
  };
}

// Make this an async server component to fetch the product data
export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  try {
    // Fetch the product by URL ID
    const product = await client.db.product.findFirst({
      where: {
        urlId: id,
      },
      include: {
        reviews: true, // Include reviews if you have a reviews relation
      },
    });

    // If product not found, return 404
    if (!product) {
      notFound();
    }

    // Calculate average rating if reviews exist
    let averageRating = 0;
    let reviewCount = 0;

    if (product.reviews && product.reviews.length > 0) {
      reviewCount = product.reviews.length;
      averageRating =
        product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviewCount;
    }

    return (
      <ProductDetailView
        product={{ ...product, rating: averageRating, reviewCount }}
      />
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}
