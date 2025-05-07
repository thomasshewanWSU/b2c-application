// @repo/utils/src/LoadingSpinner.tsx
import styles from "./loadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  fullPage?: boolean;
  message?: string;
}

export function LoadingSpinner({
  size = "medium",
  fullPage = false,
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`${styles.loadingContainer} ${fullPage ? styles.fullPage : ""}`}
    >
      <div className={`${styles.loadingSpinner} ${styles[size]}`}>
        <span className={styles.spinnerDot}></span>
        <span className={styles.spinnerDot}></span>
        <span className={styles.spinnerDot}></span>
      </div>
      {message && <p className={styles.loadingMessage}>{message}</p>}
    </div>
  );
}
