"use client";

import type { Post } from "@repo/db/data";
import { marked } from "marked";
import Image from "next/image";
import Link from "next/link";
import { toUrlPath } from "@repo/utils/url";
import styles from "./Detail.module.css";
import { useState, useEffect } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

export function BlogDetail({ post: initialPost }: { post: Post }) {
  const [post, setPost] = useState(initialPost);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Parse the Markdown content into HTML using marked
  const content = marked.parse(post.content);

  // Check if user has already liked this post
  useEffect(() => {
    async function checkLikeStatus() {
      try {
        const response = await fetch(`/api/likes/status?postId=${post.id}`);
        const data = await response.json();
        setHasLiked(data.hasLiked);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    }

    checkLikeStatus();
  }, [post.id]);

  // Handle like/unlike
  const handleLikeClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const method = hasLiked ? "DELETE" : "POST";
      const response = await fetch("/api/likes", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setPost({
          ...post,
          likes: data.likes,
        });
        setHasLiked(data.userLiked);
      }
    } catch (error) {
      console.error("Error updating like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article data-test-id={`blog-post-${post.id}`} className={styles.article}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Link href={`/post/${toUrlPath(post.title)}`}>{post.title}</Link>
        </div>

        <div className={styles.meta}>
          <span className={styles.category}>{post.category}</span>
          <span className={styles.date}>
            {new Date(post.date).toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill={true}
          className={styles.image}
          priority={true}
        />
      </div>

      <div className={styles.content}>
        <div
          className={styles.markdown}
          dangerouslySetInnerHTML={{ __html: content }}
          data-test-id="content-markdown"
        />

        <div className={styles.tags}>
          {post.tags.split(",").map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag.trim()}
            </span>
          ))}
        </div>

        <div className={styles.stats}>
          <span className={styles.stat}>{post.views} views</span>
          <div className={styles.likeContainer}>
            <button
              className={styles.likeButton}
              onClick={handleLikeClick}
              data-test-id="like-button"
              aria-label={hasLiked ? "Unlike post" : "Like post"}
              disabled={isLoading}
            >
              {hasLiked ? (
                <HeartIconSolid className={styles.heartIcon} />
              ) : (
                <HeartIcon className={styles.heartIcon} />
              )}
            </button>
            <span className={styles.stat}>{post.likes} likes</span>
          </div>
        </div>
      </div>
    </article>
  );
}
