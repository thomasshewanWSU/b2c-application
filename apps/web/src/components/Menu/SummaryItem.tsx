import Link from "next/link";
import styles from "./SummaryItem.module.css";
import { memo } from "react";

export const SummaryItem = memo(function SummaryItem({
  name,
  link,
  count,
  isSelected,
  title,
}: {
  name: string;
  link: string;
  count: number;
  isSelected: boolean;
  title?: string;
}) {
  return (
    <Link
      href={link}
      title={title}
      className={`${styles.item} ${isSelected ? `${styles.selected} selected` : ""}`}
    >
      <span data-test-id="post-count" className={styles.count}>
        {count}
      </span>
      <span className={styles.name}>{name}</span>
    </Link>
  );
});
