import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { client } from "@repo/db/client";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
  const sanitizedQuery = q.toLowerCase();

  // Only search active posts that match the query in title or description
  const filteredPosts = await client.db.post.findMany({
    where: {
      active: true,
      OR: [
        {
          title: {
            contains: sanitizedQuery,
          },
        },
        {
          description: {
            contains: sanitizedQuery,
          },
        },
      ],
    },
    orderBy: {
      date: "desc", // Newest posts first
    },
  });
  return (
    <AppLayout query={q}>
      <Main posts={filteredPosts} />
    </AppLayout>
  );
}
