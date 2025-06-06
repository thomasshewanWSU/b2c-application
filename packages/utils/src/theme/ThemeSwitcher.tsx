"use client";

import { useTheme } from "./ThemeContext";
import styles from "./themeSwitch.module.css";
import { useEffect, useState } from "react";

/**
 * Theme Switcher Component
 *
 * This component provides a UI control to toggle between light and dark themes:
 * - Uses the useTheme hook to access current theme and toggle function
 * - Displays different icons based on current theme state
 * - Renders as an IconButton that switches theme on click
 * - Shows moon icon when in light mode, sun icon when in dark mode
 * - Includes accessible text labels for each theme option
 * - Supports animated transitions between states
 */
const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();
  // For animation purposes - prevents UI flicker during SSR/hydration
  const [isMounted, setIsMounted] = useState(false);

  // Only show component after hydration to prevent mismatch between server and client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Define both icons upfront to prevent rendering differences
  const darkIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="currentColor"
      viewBox="0 0 16 16"
      className={styles.icon}
    >
      <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
    </svg>
  );

  const lightIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="currentColor"
      viewBox="0 0 16 16"
      className={styles.icon}
    >
      <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
    </svg>
  );

  // Don't render until client-side to prevent hydration mismatch
  if (!isMounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeButton}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      <div className={styles.iconWrapper}>
        {theme === "light" ? darkIcon : lightIcon}
      </div>
      <span className={styles.themeName}>
        {theme === "light" ? "Dark" : "Light"}
      </span>
    </button>
  );
};

export default ThemeSwitch;
