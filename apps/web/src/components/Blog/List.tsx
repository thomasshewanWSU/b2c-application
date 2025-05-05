import type { Post } from "@repo/db/data";
import { BlogListItem } from "./ListItem";

export function BlogList({ posts }: { posts: Post[] }) {
  return (
    <div className="py-6">
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <BlogListItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">0 posts</p>
      )}
    </div>
  );
}

export default BlogList;
