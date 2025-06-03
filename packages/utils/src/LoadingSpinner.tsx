// @repo/utils/src/LoadingSpinner.tsx
import styles from "./loadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  fullPage?: boolean;
  message?: string;
}

/**
 * Loading Spinner Component
 *
 * Renders an animated loading spinner with customizable appearance.
 * Can be displayed inline or as a full-page overlay to indicate loading states.
 * Supports different sizes and optional loading message text.
 *
 * @param {Object} props - Component properties
 * @param {"small" | "medium" | "large"} [props.size="medium"] - The size of the spinner
 * @param {boolean} [props.fullPage=false] - Whether to display as a full-page overlay
 * @param {string} [props.message="Loading..."] - Text message to display below the spinner
 * @returns {JSX.Element} The rendered loading spinner component
 */
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
