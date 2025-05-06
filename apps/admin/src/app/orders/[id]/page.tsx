import { client } from "@repo/db/client";
import { OrderDetail } from "../../../components/orders/orderDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Order #${(await params).id} | Admin`,
  };
}

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
