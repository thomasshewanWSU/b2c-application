"use client";

import { useTheme } from "./ThemeContext";
import styles from "./ThemeSwitcher.module.css";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={styles.themeButton}>
      {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
};

export default ThemeSwitch;
