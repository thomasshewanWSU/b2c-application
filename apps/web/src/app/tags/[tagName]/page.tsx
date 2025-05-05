import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { client } from "@repo/db/client";
import { toUrlPath } from "@repo/utils/url"; // Import toUrlPath

export default async function Page({
  params,
}: {
  params: Promise<{ tagName: string }>; // Keep the Promise wrapper
}) {
  const { tagName } = await params; // Keep await since params is a Promise

  // Get all distinct tags from active posts
  const allTagsData = await client.db.post.findMany({
    where: {
      active: true,
    },
    select: {
      tags: true,
    },
  });

  // Process tags data to get individual tags
  const tagMap = new Map<string, string>(); // Map of URL path -> original tag
  allTagsData.forEach((data) => {
    if (data.tags) {
      const postTags = data.tags.split(",").map((tag) => tag.trim());
      postTags.forEach((tag) => {
        const urlTag = toUrlPath(tag);
        tagMap.set(urlTag, tag);
      });
    }
  });

  // Find the original tag that matches our URL tag
  const originalTag = tagMap.get(tagName);

  // If no matching category is found, return empty posts array
  if (!originalTag) {
    return (
      <AppLayout filters={{ tag: tagName }}>
        <Main posts={[]} />
      </AppLayout>
    );
  }
  // Use Prisma's contains operator for tag filtering
  const filteredPosts = await client.db.post.findMany({
    where: {
      active: true,
      // Use contains with case-insensitivity for better matching
      tags: {
        contains: originalTag,
      },
    },
    orderBy: {
      date: "desc",
    },
  });
  return (
    <AppLayout filters={{ tag: originalTag }}>
      <Main posts={filteredPosts} />
    </AppLayout>
  );
}
