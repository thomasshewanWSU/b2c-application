import { posts } from "@repo/db/data";
import { CategoryList } from "./CategoryList";
import { HistoryList } from "./HistoryList";
import { TagList } from "./TagList";
import { Filters } from "../../types/filters";
import styles from "./LeftMenu.module.css";
import Link from "next/link";
export function LeftMenu({ filters = {} }: { filters?: Filters }) {
  const { category, tag, year, month } = filters;
  return (
    <div className={styles.sidebar}>
      <Link href="/" className={styles.logo}>
        Full Stack Blog
      </Link>
      <nav className={styles.navigation}>
        <ul className={styles.list}>
          <li>
            <CategoryList selectedCategory={category} posts={posts} />
          </li>
          <li>
            <HistoryList
              selectedYear={year}
              selectedMonth={month}
              posts={posts}
            />
          </li>
          <li>
            <TagList selectedTag={tag} posts={posts} />
          </li>
          <li>Admin</li>
        </ul>
      </nav>
    </div>
  );
}
