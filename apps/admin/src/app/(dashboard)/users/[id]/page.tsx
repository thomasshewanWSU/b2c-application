import { client } from "@repo/db/client";
import { UserDetail } from "@/components/users/UserDetail";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};
/**
 * Generate metadata for the user detail page
 *
 * Creates appropriate page title metadata for the user detail view.
 *
 * @returns {Object} The page metadata object with title property
 */
export async function generateMetadata() {
  return {
    title: `User Details | Admin`,
  };
}
/**
 * User Detail Page Component
 *
 * Renders the admin interface for viewing a specific user's details.
 * Fetches user data by ID including basic information and order statistics.
 * Also retrieves the user's most recent orders for display.
 * Handles invalid IDs and missing users with Next.js notFound() utility.
 *
 * @param {Object} props - Component properties
 * @param {Promise<{id: string}>} props.params - URL parameters containing the user ID
 * @returns {Promise<JSX.Element>} The rendered user detail page
 */
export default async function UserPage({ params }: Props) {
  const id = parseInt((await params).id, 10);

  if (isNaN(id)) {
    return notFound();
  }
  const user = await client.db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!user) {
    return notFound();
  }

  const recentOrders = await client.db.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
    },
  });

  return (
    <main>
      <UserDetail
        user={{
          ...user,
          orderCount: user._count.orders,
        }}
        recentOrders={recentOrders}
      />
    </main>
  );
}
