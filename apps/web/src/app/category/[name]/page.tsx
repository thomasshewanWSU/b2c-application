import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { client } from "@repo/db/client";
import { toUrlPath } from "@repo/utils/url";

export default async function Page({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  // Get all categories first (this is small data, not a performance issue)
  const allCategories = await client.db.post.findMany({
    select: {
      category: true,
    },
    distinct: ["category"],
  });
  // Find the matching original category by comparing URL paths
  const matchingCategory = allCategories.find(
    (cat) => toUrlPath(cat.category) === name,
  )?.category;

  // If no matching category is found, return empty posts array
  if (!matchingCategory) {
    return (
      <AppLayout filters={{ category: name }}>
        <Main posts={[]} />
      </AppLayout>
    );
  }
  // Query using the original category name
  const filteredPosts = await client.db.post.findMany({
    where: {
      active: true,
      category: matchingCategory,
    },
    orderBy: {
      date: "desc",
    },
  });

  return (
    <AppLayout filters={{ category: name }}>
      <Main posts={filteredPosts} />
    </AppLayout>
  );
}
