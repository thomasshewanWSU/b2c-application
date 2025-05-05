// import { posts, type Post } from "../components/data";

type TagItem = {
  name: string;
  count: number;
};

export async function tags(
  posts: { tags: string; active: boolean }[],
): Promise<TagItem[]> {
  // Return empty array if no posts
  if (!posts.length) return [];

  // Create a map to store tag counts
  const tagMap = new Map<string, number>();

  // Count tags from active posts
  posts
    .filter((post) => post.active)
    .forEach((post) => {
      const postTags = post.tags.split(",");
      postTags.forEach((tag) => {
        const count = tagMap.get(tag) || 0;
        tagMap.set(tag, count + 1);
      });
    });

  // Convert map to array of TagItems
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
