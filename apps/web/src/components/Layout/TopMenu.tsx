"use client";

import { useRouter } from "next/navigation";
import ThemeSwitch from "../Themes/ThemeSwitcher";
import styles from "./TopMenu.module.css";

function debounce<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  let timeoutId: any;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function TopMenu({ query }: { query?: string }) {
  const router = useRouter();

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const search = event.target.value;
      router.push(`/search?q=${search}`);
    },
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form submission from reloading the page
  };

  return (
    <header className={styles.header}>
      <form onSubmit={handleSubmit} className={styles.searchContainer}>
        <div className={styles.searchIcon}>
          {/* Simple search icon */}
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="search"
          defaultValue={query || ""}
          placeholder="Search..."
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </form>
      <div className={styles.rightControls}>
        <ThemeSwitch />
      </div>
    </header>
  );
}
