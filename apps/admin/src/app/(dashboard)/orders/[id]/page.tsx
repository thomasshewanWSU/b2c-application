import { client } from "@repo/db/client";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};
/**
 * Generate metadata for the order detail page
 *
 * Creates appropriate page title metadata for the order detail view
 * using the order ID from the URL parameters.
 *
 * @param {Object} props - Component properties
 * @param {Promise<{id: string}>} props.params - URL parameters containing the order ID
 * @returns {Promise<Metadata>} The page metadata object
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Order #${(await params).id} | Admin`,
  };
}
/**
 * Order Detail Page Component
 *
 * Renders the admin view for a specific order's details.
 * Fetches order data including user information and ordered items.
 * Handles invalid IDs and missing orders with Next.js notFound() utility.
 *
 * @param {Object} props - Component properties
 * @param {Promise<{id: string}>} props.params - URL parameters containing the order ID
 * @returns {Promise<JSX.Element>} The rendered order detail page
 */
export default async function OrderPage({ params }: Props) {
  const id = parseInt((await params).id, 10);

  if (isNaN(id)) {
    return notFound();
  }

  const order = await client.db.order
    .findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })
    .then((order) =>
      order ? { ...order, notes: order.notes || undefined } : null,
    );

  if (!order) {
    return notFound();
  }

  return (
    <main>
      <OrderDetail order={order} />
    </main>
  );
}
