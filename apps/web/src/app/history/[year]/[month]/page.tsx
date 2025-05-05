import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { client } from "@repo/db/client";

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; month: string }>; // Put the Promise wrapper back
}) {
  const { year, month } = await params; // No need to await

  const monthIndex = parseInt(month, 10) - 1; // Convert to 0-based index

  // Create start and end date objects for the month
  // Create start and end date objects for the month
  const startDate = new Date(parseInt(year), monthIndex, 1); // First day of month
  const endDate = new Date(parseInt(year), monthIndex + 1, 0); // Last day of month
  // Query using Prisma's date range operators
  const filteredPosts = await client.db.post.findMany({
    where: {
      active: true,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "desc",
    },
  });
  return (
    <AppLayout filters={{ month, year }}>
      <Main posts={filteredPosts} />
    </AppLayout>
  );
}
