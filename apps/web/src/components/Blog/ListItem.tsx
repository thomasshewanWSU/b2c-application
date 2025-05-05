import type { Post } from "@repo/db/data";
import Image from "next/image";
import Link from "next/link";
import { toUrlPath } from "@repo/utils/url";
import styles from "./ListItem.module.css";
import { memo } from "react";

export const BlogListItem = memo(function BlogListItem({
  post,
}: {
  post: Post;
}) {
  return (
    <article className={styles.article} data-test-id={`blog-post-${post.id}`}>
      <div className={styles.imageContainer}>
        <Image
          // Had issues with next/image /node_modules/.vite/deps/next_image.js:1447:22
          // So just used copilot to edit vitest.config.ts and the trim/placeholder
          src={(post.imageUrl && post.imageUrl.trim()) || "/wsulogo.png"}
          alt={post.title}
          width={200}
          height={200}
          className={styles.image}
          priority={true}
        />
      </div>

      <div className={styles.content}>
        <div>
          <div className={styles.header}>
            <div className={styles.meta}>
              <span className={styles.category}>{post.category}</span>
              <span className={styles.date}>
                {post.date.toLocaleDateString("en-AU", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <h2 className={styles.title}>
              <Link
                href={`/post/${toUrlPath(post.urlId)}`}
                className={styles.titleLink}
              >
                {post.title}
              </Link>
            </h2>
          </div>

          <p className={styles.description}>{post.description}</p>

          <div className={styles.tags}>
            {post.tags.split(",").map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag.trim()}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.stats}>
          <span className={styles.stat}>{post.likes} likes</span>
          <span className={styles.stat}>{post.views} views</span>
        </div>
      </div>
    </article>
  );
});
