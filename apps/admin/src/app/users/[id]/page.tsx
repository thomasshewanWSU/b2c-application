import { client } from "@repo/db/client";
import { UserDetail } from "../../../components/users/userDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `User Details | Admin`,
  };
}

export default async function UserPage({ params }: Props) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return notFound();
  }

  // Get user with order count
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

  // Get recent orders
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
